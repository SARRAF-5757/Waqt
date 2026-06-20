/**
 * Defines fallback colors and native iOS color palettes used throughout the app.
 */

const tintColorLight = "#4F8EF7";
const tintColorDark = "#85b1ffff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export const IOSColors = {
  light: {
    tint: "#007AFF",
    label: "#000000",
    secondaryLabel: "#3C3C4399",
    tertiaryLabel: "#3C3C434D",
    background: "#F2F2F7",
    groupedBackground: "#FFFFFF",
    secondaryGroupedBackground: "#F2F2F7",
    fill: "#78788033",
    separator: "#3C3C434D",
  },
  dark: {
    tint: "#0A84FF",
    label: "#FFFFFF",
    secondaryLabel: "#EBEBF599",
    tertiaryLabel: "#EBEBF54D",
    background: "#000000",
    groupedBackground: "#1C1C1E",
    secondaryGroupedBackground: "#2C2C2E",
    fill: "#78788059",
    separator: "#54545899",
  },
};
