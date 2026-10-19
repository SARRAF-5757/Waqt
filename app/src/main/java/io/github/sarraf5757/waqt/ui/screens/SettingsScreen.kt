/**
 * Settings screen UI for preferences and calculation controls
 */

package io.github.sarraf5757.waqt.ui.screens

import android.os.Build
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuAnchorType
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MultiChoiceSegmentedButtonRow
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.sarraf5757.waqt.R
import io.github.sarraf5757.waqt.bridge.NativeModels
import io.github.sarraf5757.waqt.ui.theme.THEME_ACCENT_OPTIONS
import io.github.sarraf5757.waqt.ui.theme.WaqtTheme
import io.github.sarraf5757.waqt.ui.viewmodels.SettingsViewModel


/**
 * Renders Settings screen layout with interactive controls and delete dialog
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(viewModel: SettingsViewModel, contentPadding: PaddingValues) {
    val prefs by viewModel.prefs.collectAsState()
    val previews by viewModel.endOptionPreviews.collectAsState()
    val settings = prefs ?: return


    SettingsScreenContent(
        settings = settings,
        previews = previews,
        contentPadding = contentPadding,
        onUpdateEndTimeOffset = { viewModel.updateEndTimeOffset(it) },
        onUpdateCalculationMethod = { viewModel.updateCalculationMethod(it) },
        onUpdateMadhab = { viewModel.updateMadhab(it) },
        onUpdateMaghribEndMode = { viewModel.updateMaghribEndMode(it) },
        onUpdateMaghribEndCustomMinutes = { viewModel.updateMaghribEndCustomMinutes(it) },
        onUpdateIshaEndMode = { viewModel.updateIshaEndMode(it) },
        onUpdateShowStartTime = { viewModel.updateShowStartTime(it) },
        onUpdateShowEndTime = { viewModel.updateShowEndTime(it) },
        onUpdateThemeColor = { viewModel.updateThemeColor(it) },
        onDeleteAllHistory = { viewModel.deleteAllHistory() }
    )
}

/**
 * Content composable rendering settings groups, option dropdowns, and danger zone
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreenContent(
    settings: NativeModels.PreferenceSettings,
    previews: NativeModels.EndOptionPreviews?,
    contentPadding: PaddingValues,
    onUpdateEndTimeOffset: (String) -> Unit,
    onUpdateCalculationMethod: (String) -> Unit,
    onUpdateMadhab: (String) -> Unit,
    onUpdateMaghribEndMode: (String) -> Unit,
    onUpdateMaghribEndCustomMinutes: (String) -> Unit,
    onUpdateIshaEndMode: (String) -> Unit,
    onUpdateShowStartTime: (Boolean) -> Unit,
    onUpdateShowEndTime: (Boolean) -> Unit,
    onUpdateThemeColor: (String) -> Unit,
    onDeleteAllHistory: () -> Unit
) {
    var showDeleteDialog by remember { mutableStateOf(false) }
    val context = LocalContext.current
    val darkTheme = isSystemInDarkTheme()

    val calculationMethods = listOf(
        "MoonsightingCommittee" to stringResource(R.string.calc_moonsighting_committee),
        "MuslimWorldLeague" to stringResource(R.string.calc_muslim_world_league),
        "Egyptian" to stringResource(R.string.calc_egyptian),
        "Karachi" to stringResource(R.string.calc_karachi),
        "UmmAlQura" to stringResource(R.string.calc_umm_al_qura),
        "Dubai" to stringResource(R.string.calc_dubai),
        "NorthAmerica" to stringResource(R.string.calc_isna),
        "Kuwait" to stringResource(R.string.calc_kuwait),
        "Qatar" to stringResource(R.string.calc_qatar),
        "Singapore" to stringResource(R.string.calc_singapore),
        "Turkey" to stringResource(R.string.calc_turkey),
        "Tehran" to stringResource(R.string.calc_tehran)
    )

    val madhabOptions = listOf(
        "shafi" to stringResource(R.string.madhab_shafi),
        "hanafi" to stringResource(R.string.madhab_hanafi)
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(contentPadding)
            .padding(horizontal = 20.dp)
            .padding(bottom = 20.dp),
        horizontalAlignment = Alignment.Start
    ) {
        Spacer(modifier = Modifier.height(26.dp))

        // Title
        Text(
            text = stringResource(R.string.settings_title),
            style = MaterialTheme.typography.titleLarge.copy(fontSize = 30.sp, fontWeight = FontWeight.Bold),
            textAlign = TextAlign.Center,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 18.dp)
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Section: Notifications
        SectionHeader(text = stringResource(R.string.section_notifications))
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
        ) {
            ListItem(
                headlineContent = {
                    Text(
                        text = stringResource(R.string.end_time_reminder_label),
                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                },
                supportingContent = {
                    TextField(
                        value = settings.endTimeOffset.toString(),
                        onValueChange = { onUpdateEndTimeOffset(it) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = MaterialTheme.colorScheme.surface,
                            unfocusedContainerColor = MaterialTheme.colorScheme.surface
                        )
                    )
                },
                colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Section: Prayer Times
        SectionHeader(text = stringResource(R.string.section_prayer_times))
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
        ) {
            Column {
                DropdownSettingItem(
                    label = stringResource(R.string.calculation_method_label),
                    currentValue = settings.calculationMethod,
                    options = calculationMethods,
                    onSelect = { onUpdateCalculationMethod(it) }
                )
                HorizontalDivider(
                    modifier = Modifier.padding(horizontal = 16.dp),
                    thickness = 0.5.dp,
                    color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
                )
                DropdownSettingItem(
                    label = stringResource(R.string.madhab_label),
                    currentValue = settings.madhab,
                    options = madhabOptions,
                    onSelect = { onUpdateMadhab(it) }
                )
                
                HorizontalDivider(
                    modifier = Modifier.padding(horizontal = 16.dp),
                    thickness = 0.5.dp,
                    color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
                )

                val maghribOptionKeys = listOf("TIED_TO_ISHA", "RED_TWILIGHT", "WHITE_TWILIGHT", "FIXED_MINUTES")
                val maghribOptions = maghribOptionKeys.mapIndexed { index, key ->
                    key to (previews?.maghribOptions?.getOrNull(index) ?: key)
                }

                DropdownSettingItem(
                    label = "Maghrib End",
                    currentValue = settings.maghribEndMode,
                    options = maghribOptions,
                    onSelect = { onUpdateMaghribEndMode(it) }
                )
                
                if (settings.maghribEndMode == "FIXED_MINUTES") {
                    ListItem(
                        headlineContent = {
                            Text(
                                text = "Maghrib Fixed Minutes: ${settings.maghribEndCustomMinutes}m",
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        },
                        supportingContent = {
                            Slider(
                                value = settings.maghribEndCustomMinutes.toFloat(),
                                onValueChange = { onUpdateMaghribEndCustomMinutes(it.toInt().toString()) },
                                valueRange = 10f..120f,
                                steps = 11,
                                modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp)
                            )
                        },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                }

                HorizontalDivider(
                    modifier = Modifier.padding(horizontal = 16.dp),
                    thickness = 0.5.dp,
                    color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
                )

                val ishaOptionKeys = listOf("ISLAMIC_MIDNIGHT", "FIRST_THIRD", "ASTRONOMICAL_MIDNIGHT", "FAJR_START")
                val ishaOptions = ishaOptionKeys.mapIndexed { index, key ->
                    key to (previews?.ishaOptions?.getOrNull(index) ?: key)
                }

                DropdownSettingItem(
                    label = "Isha End",
                    currentValue = settings.ishaEndMode,
                    options = ishaOptions,
                    onSelect = { onUpdateIshaEndMode(it) }
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Section: Appearance
        SectionHeader(text = stringResource(R.string.section_appearance))

        // Time Display Segmented Buttons
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
        ) {
            ListItem(
                headlineContent = {
                    Text(
                        text = stringResource(R.string.time_display_label),
                        style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                },
                supportingContent = {
                    val options = listOf(
                        stringResource(R.string.start_time),
                        stringResource(R.string.end_time)
                    )

                    MultiChoiceSegmentedButtonRow(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 12.dp)
                    ) {
                        // Start Time Button
                        val startTimeLabel = options[0]
                        SegmentedButton(
                            shape = SegmentedButtonDefaults.itemShape(index = 0, count = options.size),
                            onCheckedChange = {
                                onUpdateShowStartTime(!settings.showStartTime)
                            },
                            checked = settings.showStartTime,
                            icon = { SegmentedButtonDefaults.Icon(settings.showStartTime) },
                            label = {
                                Text(
                                    text = startTimeLabel,
                                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold)
                                )
                            },
                            colors = SegmentedButtonDefaults.colors(
                                activeContainerColor = MaterialTheme.colorScheme.primaryContainer,
                                activeContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        )

                        // End Time Button
                        val endTimeLabel = options[1]
                        SegmentedButton(
                            shape = SegmentedButtonDefaults.itemShape(index = 1, count = options.size),
                            onCheckedChange = {
                                onUpdateShowEndTime(!settings.showEndTime)
                            },
                            checked = settings.showEndTime,
                            icon = { SegmentedButtonDefaults.Icon(settings.showEndTime) },
                            label = {
                                Text(
                                    text = endTimeLabel,
                                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold)
                                )
                            },
                            colors = SegmentedButtonDefaults.colors(
                                activeContainerColor = MaterialTheme.colorScheme.primaryContainer,
                                activeContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        )
                    }
                },
                colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Colors
        val materialYouLabel = stringResource(R.string.material_you)
        val isMaterialYou = settings.themeColor == materialYouLabel
        // Material You - hidden on unsupported systems
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val materialYouPrimary = if (darkTheme) dynamicDarkColorScheme(context).primary else dynamicLightColorScheme(context).primary

            Spacer(modifier = Modifier.height(16.dp))

            Card(
                onClick = { onUpdateThemeColor("Material You") },
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
                        text = materialYouLabel,
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
                        onClick = { onUpdateThemeColor(colorOption.hexString) },
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
                                text = stringResource(colorOption.nameRes),
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
        SectionHeader(text = stringResource(R.string.section_danger_zone))
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
                text = stringResource(R.string.delete_all_records_btn),
                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 16.sp, fontWeight = FontWeight.Bold)
            )
        }
    }

    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text(stringResource(R.string.delete_all_records_dialog_title)) },
            text = { Text(stringResource(R.string.delete_all_records_dialog_text)) },
            confirmButton = {
                TextButton(
                    onClick = {
                        showDeleteDialog = false
                        onDeleteAllHistory()
                    }
                ) {
                    Text(stringResource(R.string.delete), color = MaterialTheme.colorScheme.error)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text(stringResource(R.string.cancel))
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
 * Renders setting item using ListItem with dropdown menu selection
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DropdownSettingItem(
    label: String,
    currentValue: String,
    options: List<Pair<String, String>>,
    onSelect: (String) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }
    val displayLabel = options.find { it.first == currentValue }?.second ?: currentValue

    ListItem(
        headlineContent = {
            Text(
                text = label,
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        },
        supportingContent = {
            ExposedDropdownMenuBox(
                expanded = expanded,
                onExpandedChange = { expanded = !expanded },
                modifier = Modifier.padding(top = 8.dp)
            ) {
                TextField(
                    value = displayLabel,
                    onValueChange = {},
                    readOnly = true,
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(type = ExposedDropdownMenuAnchorType.PrimaryNotEditable),
                    shape = RoundedCornerShape(8.dp),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = MaterialTheme.colorScheme.surface,
                        unfocusedContainerColor = MaterialTheme.colorScheme.surface
                    )
                )

                ExposedDropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false }
                ) {
                    for (option in options) {
                        val key = option.first
                        val title = option.second
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
        },
        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
        modifier = Modifier.padding(vertical = 8.dp)
    )
}

@Preview(showBackground = true)
@Composable
fun SettingsScreenPreview() {
    val mockSettings = NativeModels.PreferenceSettings(
        showStartTime = true,
        showEndTime = true,
        calculationMethod = "MuslimWorldLeague",
        madhab = "shafi",
        themeColor = "Material You",
        endTimeOffset = 5,
        latitude = 0.0,
        longitude = 0.0,
        hasLocation = false,
        historyMajorView = "Matrix",
        historyGranularity = "Monthly",
        maghribEndMode = "TIED_TO_ISHA",
        maghribEndCustomAngle = 14.0,
        maghribEndCustomMinutes = 90,
        ishaEndMode = "ISLAMIC_MIDNIGHT"
    )

    val mockPreviews = NativeModels.EndOptionPreviews(
        maghribOptions = listOf("Tied to Isha", "Red Twilight (14°)", "White Twilight (18°)", "Fixed Minutes"),
        ishaOptions = listOf("Islamic Midnight (Sunset to Fajr)", "First Third of Night", "Astronomical Midnight (Sunset to Sunrise)", "Tied to Fajr Start")
    )

    WaqtTheme {
        SettingsScreenContent(
            settings = mockSettings,
            previews = mockPreviews,
            contentPadding = PaddingValues(16.dp),
            onUpdateEndTimeOffset = {},
            onUpdateCalculationMethod = {},
            onUpdateMadhab = {},
            onUpdateMaghribEndMode = {},
            onUpdateMaghribEndCustomMinutes = {},
            onUpdateIshaEndMode = {},
            onUpdateShowStartTime = {},
            onUpdateShowEndTime = {},
            onUpdateThemeColor = {},
            onDeleteAllHistory = {}
        )
    }
}
