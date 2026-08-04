// Bottom navigation and screen routing for Jetpack Compose

package io.github.sarraf5757.waqt.ui.navigation

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.IntOffset
import androidx.navigation.NavBackStackEntry
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController

import io.github.sarraf5757.waqt.R
import io.github.sarraf5757.waqt.ui.screens.HomeScreen
import io.github.sarraf5757.waqt.ui.screens.SettingsScreen
import io.github.sarraf5757.waqt.ui.screens.StreakScreen
import io.github.sarraf5757.waqt.ui.viewmodels.HomeViewModel
import io.github.sarraf5757.waqt.ui.viewmodels.SettingsViewModel
import io.github.sarraf5757.waqt.ui.viewmodels.StreakViewModel

// Defines routes, titles, and icons for each screen
sealed class Screen(val route: String, val titleRes: Int, val icon: ImageVector) {
    object Home : Screen("home", R.string.nav_home, Icons.Default.Home)
    object History : Screen("history", R.string.nav_history, Icons.Default.DateRange)
    object Settings : Screen("settings", R.string.nav_settings, Icons.Default.Settings)
}

/**
 * Renders app with edge-to-edge background, Bottom Navigation Bar, and the active screen composable
 */
@Composable
fun AppNavigation(
    homeViewModel: HomeViewModel,
    streakViewModel: StreakViewModel,
    settingsViewModel: SettingsViewModel
) {
    val navController = rememberNavController()                         // Manages app navigation state
    val items = listOf(Screen.Home, Screen.History, Screen.Settings)    // Screens available in the bottom bar

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surfaceContainer,
                windowInsets = WindowInsets.navigationBars
            ) {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                items.forEach { screen ->
                    val title = stringResource(screen.titleRes)
                    NavigationBarItem(
                        icon = { Icon(screen.icon, contentDescription = title) },
                        label = { Text(title) },
                        selected = currentRoute == screen.route,
                        onClick = {
                            // Navigate to destination, avoiding duplicate stack entries
                            if (currentRoute != screen.route) {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = MaterialTheme.colorScheme.onSecondaryContainer,
                            selectedTextColor = MaterialTheme.colorScheme.onSurface,
                            indicatorColor = MaterialTheme.colorScheme.secondaryContainer,
                            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        // Determines animation direction based on tab index
        val routeOrder = listOf(Screen.Home.route, Screen.History.route, Screen.Settings.route)

        // Helper for snappy side-scrolling direction
        fun slideDirection(scope: AnimatedContentTransitionScope<NavBackStackEntry>) =
            if (routeOrder.indexOf(scope.targetState.destination.route) > routeOrder.indexOf(scope.initialState.destination.route))
                AnimatedContentTransitionScope.SlideDirection.Left else AnimatedContentTransitionScope.SlideDirection.Right

        // To Switch Animation: fast (tween) and bouncy (spring)
        val navAnimationSpec = spring<IntOffset>(
            dampingRatio = Spring.DampingRatioLowBouncy,
            stiffness = Spring.StiffnessMedium
        )

        // Handles screen swapping and transitions
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            enterTransition = { slideIntoContainer(slideDirection(this), navAnimationSpec) },
            exitTransition = { slideOutOfContainer(slideDirection(this), navAnimationSpec) },
            popEnterTransition = { slideIntoContainer(slideDirection(this), navAnimationSpec) },
            popExitTransition = { slideOutOfContainer(slideDirection(this), navAnimationSpec) }
        ) {
            composable(Screen.Home.route) {
                HomeScreen(viewModel = homeViewModel)
            }
            composable(Screen.History.route) {
                StreakScreen(viewModel = streakViewModel)
            }
            composable(Screen.Settings.route) {
                SettingsScreen(viewModel = settingsViewModel)
            }
        }
    }
}
