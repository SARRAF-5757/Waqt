import React, { useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, ScrollView, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";

export interface PickerItem {
  label: string;
  value: string;
}

interface CustomPickerProps {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: PickerItem[];
}

export function CustomPicker({ label, selectedValue, onValueChange, items }: CustomPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const themedColors = useThemeColors();

  const selectedItem = items.find((i) => i.value === selectedValue);

  return (
    <>
      <TouchableOpacity
        style={[styles.pickerButton, { borderColor: themedColors.outline, backgroundColor: themedColors.surface }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <ThemedText style={[styles.pickerButtonText, { color: themedColors.onSurface }]}>
          {selectedItem ? selectedItem.label : "Select..."}
        </ThemedText>
        <Ionicons name="chevron-down" size={20} color={themedColors.onSurface} />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <ThemedView style={[styles.modalContent, { backgroundColor: themedColors.surfaceContainerHigh || themedColors.surface }]}>
            <ThemedText style={[styles.modalTitle, { color: themedColors.onSurface }]}>{label}</ThemedText>
            
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {items.map((item) => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.itemButton,
                      { backgroundColor: isSelected ? themedColors.secondaryContainer : "transparent" }
                    ]}
                    onPress={() => {
                      onValueChange(item.value);
                      setModalVisible(false);
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.itemText,
                        { 
                          color: isSelected ? themedColors.onSecondaryContainer : themedColors.onSurface,
                          fontWeight: isSelected ? "bold" : "normal"
                        }
                      ]}
                    >
                      {item.label}
                    </ThemedText>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={themedColors.onSecondaryContainer} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  pickerButtonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxHeight: "80%",
    borderRadius: 24,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
  },
});
