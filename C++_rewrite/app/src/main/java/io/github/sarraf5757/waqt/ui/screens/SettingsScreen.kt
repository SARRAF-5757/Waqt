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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

import io.github.sarraf5757.waqt.R
import io.github.sarraf5757.waqt.ui.theme.THEME_ACCENT_OPTIONS
import io.github.sarraf5757.waqt.ui.viewmodels.SettingsViewModel


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
            .padding(horizontal = 20.dp)
            .padding(bottom = 120.dp),
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
                        onValueChange = { viewModel.updateEndTimeOffset(it) },
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
                    onSelect = { viewModel.updateCalculationMethod(it) }
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
                    onSelect = { viewModel.updateMadhab(it) }
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
                        options.forEachIndexed { index, label ->
                            SegmentedButton(
                                shape = SegmentedButtonDefaults.itemShape(index = index, count = options.size),
                                onCheckedChange = {
                                    if (index == 0) viewModel.updateShowStartTime(!settings.showStartTime)
                                    else viewModel.updateShowEndTime(!settings.showEndTime)
                                },
                                checked = if (index == 0) settings.showStartTime else settings.showEndTime,
                                icon = { SegmentedButtonDefaults.Icon(if (index == 0) settings.showStartTime else settings.showEndTime) },
                                label = {
                                    Text(
                                        text = label,
                                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold)
                                    )
                                },
                                colors = SegmentedButtonDefaults.colors(
                                    activeContainerColor = MaterialTheme.colorScheme.primaryContainer,
                                    activeContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                            )
                        }
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
                        viewModel.deleteAllHistory()
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
        },
        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
        modifier = Modifier.padding(vertical = 8.dp)
    )
}
