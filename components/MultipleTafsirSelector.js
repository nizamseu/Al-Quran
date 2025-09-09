import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useFont } from "../contexts/FontContext";
import { useLanguage } from "../contexts/LanguageContext";

const MultipleTafsirSelector = ({
  visible,
  onClose,
  selectedTafsir,
  onSelectionChange,
  availableTafsir,
}) => {
  const { colors } = useTheme();
  const { getTextStyle } = useFont();
  const { t } = useLanguage();

  const handleTafsirToggle = (tafsir) => {
    const isSelected = selectedTafsir.some((t) => t.id === tafsir.id);
    let newSelection;

    if (isSelected) {
      newSelection = selectedTafsir.filter((t) => t.id !== tafsir.id);
    } else {
      newSelection = [...selectedTafsir, tafsir];
    }

    onSelectionChange(newSelection);
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      margin: 20,
      maxHeight: "80%",
      width: "90%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      ...getTextStyle("title", "bold"),
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    scrollContainer: {
      maxHeight: 400,
    },
    tafsirItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: colors.primary,
      marginRight: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    checkedBox: {
      backgroundColor: colors.primary,
    },
    tafsirInfo: {
      flex: 1,
    },
    tafsirName: {
      ...getTextStyle("body", "medium"),
      color: colors.text,
      marginBottom: 4,
    },
    tafsirLanguage: {
      ...getTextStyle("caption"),
      color: colors.textSecondary,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    selectedCount: {
      ...getTextStyle("caption"),
      color: colors.textSecondary,
    },
    clearButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    clearButtonText: {
      ...getTextStyle("body"),
      color: colors.textSecondary,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t("selectTafsir")}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tafsir List */}
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {availableTafsir.map((tafsir) => {
              const isSelected = selectedTafsir.some((t) => t.id === tafsir.id);

              return (
                <TouchableOpacity
                  key={tafsir.id}
                  style={styles.tafsirItem}
                  onPress={() => handleTafsirToggle(tafsir)}
                >
                  <View
                    style={[styles.checkbox, isSelected && styles.checkedBox]}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>

                  <View style={styles.tafsirInfo}>
                    <Text style={styles.tafsirName}>{tafsir.name}</Text>
                    <Text style={styles.tafsirLanguage}>
                      {tafsir.language.toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.selectedCount}>
              {selectedTafsir.length} {t("selected")}
            </Text>

            {selectedTafsir.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => onSelectionChange([])}
              >
                <Text style={styles.clearButtonText}>{t("clearAll")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MultipleTafsirSelector;
