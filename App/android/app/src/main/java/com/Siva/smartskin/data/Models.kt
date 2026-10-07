package com.Siva.smartskin.data

data class UserSession(
    val uid: String = "",
    val email: String = "",
    val displayName: String = ""
)

data class ProductItem(
    val id: String = "",
    val name: String = "",
    val type: String = "cleanser",
    val condition: String = "normal",
    val description: String = "",
    val usage: String = "Daily"
)

data class ScanResult(
    val id: String = "",
    val userId: String = "",
    val primaryCondition: String = "normal",
    val confidence: Int = 95,
    val severity: String = "none",
    val imageUrl: String = "",
    val timestamp: Long = System.currentTimeMillis(),
    val overallScore: Int = 92,
    val recommendedProducts: List<ProductItem> = emptyList()
)
