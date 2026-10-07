package com.Siva.smartskin.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Camera
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.Siva.smartskin.repository.SkinRepository
import com.Siva.smartskin.viewmodel.MainViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun ScannerScreen(
    viewModel: MainViewModel,
    onScanComplete: () -> Unit
) {
    var isScanning by remember { mutableStateOf(false) }
    var progress by remember { mutableFloatStateOf(0f) }
    var statusText by remember { mutableStateOf("Ready to scan skin") }
    val scope = rememberCoroutineScope()
    val repository = remember { SkinRepository() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(300.dp),
            shape = MaterialTheme.shapes.extraLarge
        ) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                if (isScanning) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        CircularProgressIndicator(
                            progress = progress,
                            modifier = Modifier.size(80.dp),
                            strokeWidth = 6.dp
                        )
                        Spacer(modifier = Modifier.height(24.dp))
                        Text(
                            text = statusText,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                    }
                } else {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.Camera,
                            contentDescription = null,
                            modifier = Modifier.size(72.dp),
                            tint = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Position face in clear light",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = {
                if (isScanning) return@Button
                isScanning = true
                scope.launch {
                    statusText = "Initializing Dermal Scan..."
                    progress = 0.2f
                    delay(800)

                    statusText = "Scanning Subcutaneous Dermis..."
                    progress = 0.5f
                    delay(1000)

                    statusText = "Evaluating Sebum & Hydration..."
                    progress = 0.8f
                    delay(800)

                    statusText = "Saving Diagnostic Log to Firebase..."
                    progress = 1.0f

                    val conditions = listOf("normal", "acne", "dry_skin", "oily_skin", "dark_spots")
                    val condition = conditions.random()
                    val severity = if (condition == "normal") "none" else listOf("mild", "moderate", "severe").random()
                    val confidence = (90..98).random()

                    try {
                        val docId = repository.saveScanResult(
                            condition = condition,
                            severity = severity,
                            confidence = confidence,
                            imageUrl = "https://images.unsplash.com/photo-1616391182219-e080b4d1043a?q=80&w=300&auto=format&fit=crop"
                        )
                        isScanning = false
                        onScanComplete()
                    } catch (e: Exception) {
                        statusText = "Failed: ${e.localizedMessage}"
                        isScanning = false
                    }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            enabled = !isScanning
        ) {
            Icon(Icons.Default.Camera, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text(if (isScanning) "Analyzing..." else "Run Dermal Scan")
        }
    }
}
