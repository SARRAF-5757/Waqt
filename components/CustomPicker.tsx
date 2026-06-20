import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  View,
  Platform,
  useColorScheme,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { useThemeColors } from "@/hooks/useThemeColors";

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
 * Dropdown picker used on the Settings screen.
 * iOS opens a blurred sheet. Android opens a Material-style dialog card.
 */
export function CustomPicker({ label, selectedValue, onValueChange, items }: CustomPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const isIOS = Platform.OS === 'ios';

  // Find the human-readable label for the currently selected value.
  let selectedLabel = "Select...";
  for (let i = 0; i < items.length; i++) {
    if (items[i].value === selectedValue) {
      selectedLabel = items[i].label;
      break;
    }
  }

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleSelect = (value: string) => {
    onValueChange(value);
    closeModal();
  };

  return (
    <>
      <Pressable
        onPress={() => setModalVisible(true)}
        android_ripple={{ color: colors.primary }}
        style={[
          styles.pickerButton,
          isIOS ? styles.iosPickerButton : styles.androidPickerButton,
          {
            borderColor: colors.outline,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <ThemedText style={[styles.pickerButtonText, { color: colors.onSurface }]}>
          {selectedLabel}
        </ThemedText>
        <Ionicons name="chevron-down" size={20} color={colors.onSurfaceVariant} />
      </Pressable>

      <Modal animationType={isIOS ? "slide" : "fade"} transparent visible={modalVisible} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeModal} />

          {isIOS ? (
            <View style={[styles.iosSheetContainer, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}>
              <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.iosSheetBlur}>
                <View style={[styles.iosSheetContent, { borderColor: colors.outline }]}>
                  <ThemedText style={[styles.modalTitle, { color: colors.onSurface }]}>{label}</ThemedText>
                  <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {items.map((item) => {
                      const isSelected = item.value === selectedValue;
                      return (
                        <Pressable
                          key={item.value}
                          onPress={() => handleSelect(item.value)}
                          style={({ pressed }) => [
                            styles.itemButton,
                            {
                              backgroundColor: isSelected ? colors.secondaryContainer : "transparent",
                              opacity: pressed ? 0.75 : 1,
                            },
                          ]}
                        >
                          <ThemedText
                            style={[
                              styles.itemText,
                              {
                                color: isSelected ? colors.onSecondaryContainer : colors.onSurface,
                                fontWeight: isSelected ? "600" : "400",
                              },
                            ]}
                          >
                            {item.label}
                          </ThemedText>
                          {isSelected && (
                            <Ionicons name="checkmark" size={20} color={colors.onSecondaryContainer} />
                          )}
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              </BlurView>
            </View>
          ) : (
            <View style={styles.androidDialogOverlay}>
              <View
                style={[
                  styles.androidDialogContent,
                  {
                    backgroundColor: colors.surfaceContainerHigh || colors.surface,
                    elevation: 6,
                  },
                ]}
              >
                <ThemedText style={[styles.modalTitle, { color: colors.onSurface }]}>{label}</ThemedText>
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                  {items.map((item) => {
                    const isSelected = item.value === selectedValue;
                    return (
                      <Pressable
                        key={item.value}
                        onPress={() => handleSelect(item.value)}
                        android_ripple={{ color: colors.primary }}
                        style={[
                          styles.itemButton,
                          {
                            backgroundColor: isSelected ? colors.secondaryContainer : "transparent",
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.itemText,
                            {
                              color: isSelected ? colors.onSecondaryContainer : colors.onSurface,
                              fontWeight: isSelected ? "600" : "400",
                            },
                          ]}
                        >
                          {item.label}
                        </ThemedText>
                        {isSelected && (
                          <Ionicons name="checkmark" size={20} color={colors.onSecondaryContainer} />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  iosPickerButton: {
    borderRadius: 12,
  },
  androidPickerButton: {
    borderRadius: 16,
  },
  pickerButtonText: {
    fontSize: 16,
    flex: 1,
    paddingRight: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  iosSheetContainer: {
    padding: 12,
    maxHeight: "80%",
  },
  iosSheetBlur: {
    borderRadius: 24,
    overflow: "hidden",
    flexShrink: 1,
  },
  iosSheetContent: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 24,
    padding: 20,
    flexShrink: 1,
  },
  androidDialogOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  androidDialogContent: {
    width: "100%",
    maxHeight: "80%",
    borderRadius: 28,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  scrollContainer: {
    width: "100%",
  },
  itemButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  itemText: {
    fontSize: 16,
    flex: 1,
    paddingRight: 8,
  },
});
