/**
 * Defines default configuration values and options used in the Settings screen.
 */

export const DEFAULT_SETTINGS = {
  endTimeOffset: "15",
  calculationMethod: "MoonsightingCommittee",
  madhab: "shafi",
  themeColor: "#007AFF",
  fallbackThemeColor: "#007AFF",
};

export const STORAGE_KEYS = {
  endTimeOffset: "endTimeOffset",
  calculationMethod: "calculationMethod",
  madhab: "madhab",
  themeColor: "themeColor",
};

export const CALCULATION_METHOD_OPTIONS = [
  { label: "Muslim World League", value: "MuslimWorldLeague" },
  { label: "Egyptian General Authority of Survey", value: "Egyptian" },
  { label: "University of Islamic Sciences, Karachi", value: "Karachi" },
  { label: "Umm Al-Qura University, Makkah", value: "UmmAlQura" },
  { label: "Dubai", value: "Dubai" },
  { label: "Moonsighting Committee Worldwide", value: "MoonsightingCommittee" },
  { label: "Islamic Society of North America (ISNA)", value: "NorthAmerica" },
  { label: "Kuwait", value: "Kuwait" },
  { label: "Qatar", value: "Qatar" },
  { label: "Singapore", value: "Singapore" },
  { label: "Turkey", value: "Turkey" },
  { label: "Tehran", value: "Tehran" }
];

export const MADHAB_OPTIONS = [
  { label: "Shafi/Maliki/Hanbali", value: "shafi" },
  { label: "Hanafi", value: "hanafi" }
];

export const THEME_COLOR_OPTIONS = [
  { name: "Blue", color: "#007AFF" },
  { name: "Green", color: "#34C759" },
  { name: "Indigo", color: "#5856D6" },
  { name: "Orange", color: "#FF9500" },
  { name: "Pink", color: "#FF2D55" },
  { name: "Purple", color: "#AF52DE" },
  { name: "Red", color: "#FF3B30" },
  { name: "Teal", color: "#5AC8FA" },
  { name: "Yellow", color: "#FFCC00" }
];

export const MATERIAL_YOU_KEY = "Material You";
