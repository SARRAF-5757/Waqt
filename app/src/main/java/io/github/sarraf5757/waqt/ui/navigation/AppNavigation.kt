// Bottom navigation and screen routing for Jetpack Compose

package io.github.sarraf5757.waqt.ui.navigation

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBars
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
import androidx.navigation.NavDestination.Companion.hasRoute
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import kotlinx.serialization.Serializable

import io.github.sarraf5757.waqt.R
import io.github.sarraf5757.waqt.ui.screens.HomeScreen
import io.github.sarraf5757.waqt.ui.screens.SettingsScreen
import io.github.sarraf5757.waqt.ui.screens.StreakScreen
import io.github.sarraf5757.waqt.ui.viewmodels.HomeViewModel
import io.github.sarraf5757.waqt.ui.viewmodels.SettingsViewModel
import io.github.sarraf5757.waqt.ui.viewmodels.StreakViewModel

@Serializable
object HomeRoute

@Serializable
object HistoryRoute

@Serializable
object SettingsRoute

// Wrapper for UI representation
data class BottomNavItem<T : Any>(val route: T, val titleRes: Int, val icon: ImageVector)

val navItems = listOf(
    BottomNavItem(HomeRoute, R.string.nav_home, Icons.Default.Home),
    BottomNavItem(HistoryRoute, R.string.nav_history, Icons.Default.DateRange),
    BottomNavItem(SettingsRoute, R.string.nav_settings, Icons.Default.Settings)
)

/**
 * Renders app with edge-to-edge background, Bottom Navigation Bar, and the active screen composable
 */
@Composable
fun AppNavigation(
    homeViewModel: HomeViewModel,
    streakViewModel: StreakViewModel,
    settingsViewModel: SettingsViewModel
) {
    val navController = rememberNavController() // Manages app navigation state

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surfaceContainer,
                windowInsets = WindowInsets.navigationBars
            ) {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentDestination = navBackStackEntry?.destination

                for (screen in navItems) {
                    val title = stringResource(screen.titleRes)
                    val isSelected = currentDestination?.hasRoute(screen.route::class) == true
                    
                    NavigationBarItem(
                        icon = { Icon(screen.icon, contentDescription = title) },
                        label = { Text(title) },
                        selected = isSelected,
                        onClick = {
                            if (!isSelected) {
                                navController.navigate(screen.route) {
                                    val startId = navController.graph.findStartDestination().id
                                    popUpTo(startId) {
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
        // Handles screen swapping and transitions
        NavHost(
            navController = navController,
            startDestination = HomeRoute,
            modifier = Modifier.fillMaxSize(),
            enterTransition = {
                val fromIndex = navItems.indexOfFirst { initialState.destination.hasRoute(it.route::class) }
                val toIndex = navItems.indexOfFirst { targetState.destination.hasRoute(it.route::class) }

                val direction = if (toIndex < fromIndex) {
                    AnimatedContentTransitionScope.SlideDirection.Right
                } else {
                    AnimatedContentTransitionScope.SlideDirection.Left
                }

                slideIntoContainer(
                    direction,
                    spring<IntOffset>(
                        dampingRatio = Spring.DampingRatioLowBouncy,
                        stiffness = Spring.StiffnessMedium
                    )
                )
            },
            exitTransition = {
                val fromIndex = navItems.indexOfFirst { initialState.destination.hasRoute(it.route::class) }
                val toIndex = navItems.indexOfFirst { targetState.destination.hasRoute(it.route::class) }

                val direction = if (toIndex < fromIndex) {
                    AnimatedContentTransitionScope.SlideDirection.Right
                } else {
                    AnimatedContentTransitionScope.SlideDirection.Left
                }

                slideOutOfContainer(
                    direction,
                    spring<IntOffset>(
                        dampingRatio = Spring.DampingRatioLowBouncy,
                        stiffness = Spring.StiffnessMedium
                    )
                )
            }
        ) {
            composable<HomeRoute> {
                HomeScreen(viewModel = homeViewModel, contentPadding = innerPadding)
            }
            composable<HistoryRoute> {
                StreakScreen(viewModel = streakViewModel, contentPadding = innerPadding)
            }
            composable<SettingsRoute> {
                SettingsScreen(viewModel = settingsViewModel, contentPadding = innerPadding)
            }
        }
    }
}
