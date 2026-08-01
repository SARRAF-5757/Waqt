// Settings screen UI for preferences and calculation controls

package io.github.sarraf5757.waqt.ui.screens

import android.os.Build
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.sarraf5757.waqt.ui.theme.THEME_ACCENT_OPTIONS
import io.github.sarraf5757.waqt.ui.viewmodels.SettingsViewModel

val CALCULATION_METHODS = listOf(
    "MoonsightingCommittee" to "Moonsighting Committee Worldwide",
    "MuslimWorldLeague" to "Muslim World League",
    "Egyptian" to "Egyptian General Authority of Survey",
    "Karachi" to "University of Islamic Sciences, Karachi",
    "UmmAlQura" to "Umm Al-Qura University, Makkah",
    "Dubai" to "Dubai",
    "NorthAmerica" to "Islamic Society of North America (ISNA)",
    "Kuwait" to "Kuwait",
    "Qatar" to "Qatar",
    "Singapore" to "Singapore",
    "Turkey" to "Turkey",
    "Tehran" to "Tehran"
)

val MADHAB_OPTIONS = listOf(
    "shafi" to "Shafi/Maliki/Hanbali",
    "hanafi" to "Hanafi"
)

/**
 * Renders Settings screen layout with interactive controls and delete dialog
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(viewModel: SettingsViewModel) {
    val prefs by viewModel.prefs.collectAsState()
    var showDeleteDialog by remember { mutableStateOf(false) }
    val settings = prefs ?: return
    val context = LocalContext.current
    val darkTheme = isSystemInDarkTheme()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp)
            .padding(bottom = 120.dp),
        horizontalAlignment = Alignment.Start
    ) {
        Spacer(modifier = Modifier.height(26.dp))

        // Title
        Text(
            text = "Settings",
            style = MaterialTheme.typography.titleLarge.copy(fontSize = 30.sp, fontWeight = FontWeight.Bold),
            textAlign = TextAlign.Center,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 18.dp)
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Section: Notifications
        SectionHeader(text = "Notifications")
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Waqt end time reminder (minutes before)",
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedTextField(
                    value = settings.endTimeOffset.toString(),
                    onValueChange = { viewModel.updateEndTimeOffset(it) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = MaterialTheme.colorScheme.surface,
                        unfocusedContainerColor = MaterialTheme.colorScheme.surface
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Section: Prayer Times
        SectionHeader(text = "Prayer Times")
        DropdownSettingCard(
            label = "Calculation Method",
            currentValue = settings.calculationMethod,
            options = CALCULATION_METHODS,
            onSelect = { viewModel.updateCalculationMethod(it) }
        )

        Spacer(modifier = Modifier.height(12.dp))

        DropdownSettingCard(
            label = "Madhab (Asr Shadow)",
            currentValue = settings.madhab,
            options = MADHAB_OPTIONS,
            onSelect = { viewModel.updateMadhab(it) }
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Section: Appearance
        SectionHeader(text = "Appearance")

        // Time Display Segmented Buttons
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Time Display",
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = settings.showStartTime,
                        onClick = { viewModel.updateShowStartTime(!settings.showStartTime) },
                        label = { Text("Start Time") },
                        modifier = Modifier.weight(1f)
                    )
                    FilterChip(
                        selected = settings.showEndTime,
                        onClick = { viewModel.updateShowEndTime(!settings.showEndTime) },
                        label = { Text("End Time") },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Colors
        val isMaterialYou = settings.themeColor == "Material You"

        // Material You - hidden on unsupported systems
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val materialYouPrimary = if (darkTheme) dynamicDarkColorScheme(context).primary else dynamicLightColorScheme(context).primary

            Spacer(modifier = Modifier.height(16.dp))

            Card(
                onClick = { viewModel.updateThemeColor("Material You") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (isMaterialYou) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceContainer
                )
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(materialYouPrimary)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Material You",
                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                        color = if (isMaterialYou) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Custom Colors Grid
        val chunkedColors = THEME_ACCENT_OPTIONS.chunked(2)
        chunkedColors.forEach { rowColors ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                rowColors.forEach { colorOption ->
                    val isSelected = !isMaterialYou && settings.themeColor.equals(colorOption.hexString, ignoreCase = true)
                    Card(
                        onClick = { viewModel.updateThemeColor(colorOption.hexString) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceContainer
                        )
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(colorOption.color)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = colorOption.name,
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                color = if (isSelected) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
                if (rowColors.size == 1) {
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Section: Danger Zone
        SectionHeader(text = "Danger Zone")
        Spacer(modifier = Modifier.height(8.dp))

        Button(
            onClick = { showDeleteDialog = true },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            shape = RoundedCornerShape(30.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.errorContainer,
                contentColor = MaterialTheme.colorScheme.error
            )
        ) {
            Text(
                text = "DELETE ALL RECORDS",
                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 16.sp, fontWeight = FontWeight.Bold)
            )
        }
    }

    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("Delete all records") },
            text = { Text("Are you sure you want to delete all prayer time history recorded so far? This action cannot be undone.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showDeleteDialog = false
                        viewModel.deleteAllHistory()
                    }
                ) {
                    Text("Delete", color = MaterialTheme.colorScheme.error)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

/**
 * Renders bold section header text
 */
@Composable
fun SectionHeader(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleMedium.copy(fontSize = 22.sp, fontWeight = FontWeight.Bold),
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier.padding(vertical = 12.dp)
    )
}

/**
 * Renders setting card with dropdown menu selection
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DropdownSettingCard(
    label: String,
    currentValue: String,
    options: List<Pair<String, String>>,
    onSelect: (String) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }
    val displayLabel = options.find { it.first == currentValue }?.second ?: currentValue

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(8.dp))

            ExposedDropdownMenuBox(
                expanded = expanded,
                onExpandedChange = { expanded = !expanded }
            ) {
                OutlinedTextField(
                    value = displayLabel,
                    onValueChange = {},
                    readOnly = true,
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(type = ExposedDropdownMenuAnchorType.PrimaryNotEditable),
                    shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = MaterialTheme.colorScheme.surface,
                        unfocusedContainerColor = MaterialTheme.colorScheme.surface
                    )
                )

                ExposedDropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false }
                ) {
                    options.forEach { (key, title) ->
                        DropdownMenuItem(
                            text = { Text(title) },
                            onClick = {
                                expanded = false
                                onSelect(key)
                            }
                        )
                    }
                }
            }
        }
    }
}
