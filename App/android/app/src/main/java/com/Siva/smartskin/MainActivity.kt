package com.Siva.smartskin

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.Siva.smartskin.ui.screens.*
import com.Siva.smartskin.ui.theme.SmartSkinTheme
import com.Siva.smartskin.viewmodel.MainViewModel

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Dashboard : Screen("dashboard", "Dashboard", Icons.Default.Dashboard)
    object History : Screen("history", "History", Icons.Default.History)
    object Scanner : Screen("scanner", "Scanner", Icons.Default.QrCodeScanner)
    object Products : Screen("products", "Products", Icons.Default.ShoppingBag)
}

class MainActivity : ComponentActivity() {
    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            SmartSkinTheme {
                val isLoggedIn by viewModel.isLoggedIn.collectAsState()

                if (!isLoggedIn) {
                    LoginScreen(onLoginSuccess = { })
                } else {
                    MainAppScaffold(viewModel = viewModel)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScaffold(viewModel: MainViewModel) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val bottomNavItems = listOf(
        Screen.Dashboard,
        Screen.History,
        Screen.Scanner,
        Screen.Products
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Smart Skin AI", style = MaterialTheme.typography.titleLarge) },
                actions = {
                    TextButton(onClick = { viewModel.logout() }) {
                        Text("Log Out")
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar {
                bottomNavItems.forEach { screen ->
                    NavigationBarItem(
                        icon = { Icon(screen.icon, contentDescription = screen.title) },
                        label = { Text(screen.title) },
                        selected = currentRoute == screen.route,
                        onClick = {
                            if (currentRoute != screen.route) {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.startDestinationId) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Dashboard.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Dashboard.route) {
                DashboardScreen(
                    viewModel = viewModel,
                    onNavigateToScanner = { navController.navigate(Screen.Scanner.route) },
                    onNavigateToResults = { navController.navigate("results") },
                    onNavigateToProducts = { navController.navigate(Screen.Products.route) }
                )
            }
            composable(Screen.History.route) {
                HistoryScreen(
                    viewModel = viewModel,
                    onNavigateToResults = { navController.navigate("results") }
                )
            }
            composable(Screen.Scanner.route) {
                ScannerScreen(
                    viewModel = viewModel,
                    onScanComplete = { navController.navigate(Screen.History.route) }
                )
            }
            composable(Screen.Products.route) {
                ProductsScreen(viewModel = viewModel)
            }
            composable("results") {
                ResultsDetailScreen(
                    viewModel = viewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }
}
