import React from "react";
import { View } from "react-native";
import { Picker, Host } from "@expo/ui";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMaterial3ThemeContext } from "@/providers/materialYouProvider";
import { MATERIAL_YOU_KEY } from "@/constants/Settings";

export type PickerItem = {
  label: string;
  value: string;
};

type CustomPickerProps = {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: PickerItem[];
};

/**
 * Dropdown picker wrapper using @expo/ui (Jetpack Compose backend).
 *
 * Note: @expo/ui's Picker ignores most React Native styling props
 * natively on Android. We apply standard styling here via 'style'
 * so it matches other text inputs, and use 'width: 100%' so it spans edges.
 */
export function CustomPicker({ selectedValue, onValueChange, items }: CustomPickerProps) {
  const colors = useThemeColors();
  const { currentColor } = useMaterial3ThemeContext();

  return (
    <View style={{ width: "100%", marginTop: 8 }}>
      <Host seedColor={currentColor === MATERIAL_YOU_KEY ? undefined : currentColor} style={{ flex: 1, minHeight: 50 }}>
        <Picker selectedValue={selectedValue} onValueChange={onValueChange} appearance="menu">
          {items.map((item) => (
            <Picker.Item key={item.value} label={item.label} value={item.value} />
          ))}
        </Picker>
      </Host>
    </View>
  );
}
