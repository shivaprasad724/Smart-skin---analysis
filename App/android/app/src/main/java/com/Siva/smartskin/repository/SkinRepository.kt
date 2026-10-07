package com.Siva.smartskin.repository

import com.Siva.smartskin.data.ProductItem
import com.Siva.smartskin.data.ScanResult
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class SkinRepository {
    private val firestore = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()

    val currentUserId: String?
        get() = auth.currentUser?.uid

    val currentUserEmail: String?
        get() = auth.currentUser?.email

    val currentUserDisplayName: String?
        get() = auth.currentUser?.displayName

    // Observe user scan history from Firestore in real-time
    fun getUserScans(userId: String): Flow<List<ScanResult>> = callbackFlow {
        if (userId.isEmpty()) {
            trySend(emptyList())
            close()
            return@callbackFlow
        }

        val listener = firestore.collection("SkinAnalysis")
            .whereEqualTo("userId", userId)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    trySend(emptyList())
                    return@addSnapshotListener
                }

                if (snapshot != null) {
                    val scans = snapshot.documents.mapNotNull { doc ->
                        val data = doc.data ?: return@mapNotNull null
                        val condition = data["skin_condition"] as? String ?: "normal"
                        val conf = (data["confidence"] as? Long)?.toInt() ?: 90
                        val sev = data["severity"] as? String ?: "none"
                        val img = data["image_url"] as? String ?: ""
                        
                        val created = data["created_at"]
                        val time = when (created) {
                            is com.google.firebase.Timestamp -> created.toDate().time
                            is Long -> created
                            else -> System.currentTimeMillis()
                        }

                        ScanResult(
                            id = doc.id,
                            userId = userId,
                            primaryCondition = condition,
                            confidence = conf,
                            severity = sev,
                            imageUrl = img,
                            timestamp = time,
                            overallScore = conf
                        )
                    }.sortedByDescending { it.timestamp }

                    trySend(scans)
                }
            }

        awaitClose { listener.remove() }
    }

    // Observe global products from Firestore in real-time
    fun getGlobalProducts(): Flow<List<ProductItem>> = callbackFlow {
        val listener = firestore.collection("products")
            .addSnapshotListener { snapshot, error ->
                if (error != null || snapshot == null) {
                    trySend(emptyList())
                    return@addSnapshotListener
                }

                val products = snapshot.documents.mapNotNull { doc ->
                    val data = doc.data ?: return@mapNotNull null
                    ProductItem(
                        id = doc.id,
                        name = data["name"] as? String ?: "Skincare Item",
                        type = data["type"] as? String ?: "cleanser",
                        condition = data["condition"] as? String ?: "normal",
                        description = data["description"] as? String ?: "",
                        usage = data["usage"] as? String ?: "Daily"
                    )
                }

                trySend(products)
            }

        awaitClose { listener.remove() }
    }

    // Save a new scan result
    suspend fun saveScanResult(condition: String, severity: String, confidence: Int, imageUrl: String): String {
        val userId = currentUserId ?: throw IllegalStateException("User not logged in")

        val docData = hashMapOf(
            "userId" to userId,
            "skin_condition" to condition,
            "severity" to severity,
            "confidence" to confidence,
            "image_url" to imageUrl,
            "created_at" to com.google.firebase.Timestamp.now()
        )

        val ref = firestore.collection("SkinAnalysis").add(docData).await()
        return ref.id
    }
}
