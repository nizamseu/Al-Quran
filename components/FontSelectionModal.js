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

const FontSelectionModal = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const {
    getTextStyle,
    getArabicTextStyle,
    getBengaliTextStyle,
    fontFamilies,
    arabicFontFamily,
    bengaliFontFamily,
    changeArabicFontFamily,
    changeBengaliFontFamily,
    getArabicFonts,
    getBengaliFonts,
    fontSize,
    changeFontSize,
    fontSizes,
  } = useFont();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState("arabic"); // 'arabic', 'bengali', 'size'

  const arabicFonts = getArabicFonts();
  const bengaliFonts = getBengaliFonts();

  const previewTextArabic = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
  const previewTextBengali = "পরম করুণাময় অসীম দয়ালু আল্লাহর নামে";

  const handleArabicFontChange = (fontKey) => {
    changeArabicFontFamily(fontKey);
  };

  const handleBengaliFontChange = (fontKey) => {
    changeBengaliFontFamily(fontKey);
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      flex: 1,
      backgroundColor: colors.background,
      marginTop: 50,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    title: {
      ...getTextStyle("title", "bold"),
      color: colors.text,
    },
    closeButton: {
      padding: 8,
    },
    tabContainer: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 16,
      alignItems: "center",
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    activeTab: {
      borderBottomColor: colors.primary,
    },
    tabText: {
      ...getTextStyle("body", "medium"),
      color: colors.textSecondary,
    },
    activeTabText: {
      color: colors.primary,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    sectionTitle: {
      ...getTextStyle("subtitle", "bold"),
      color: colors.text,
      marginBottom: 16,
    },
    fontItem: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: 16,
    },
    fontHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    fontName: {
      ...getTextStyle("body", "medium"),
      color: colors.text,
      flex: 1,
    },
    selectedIndicator: {
      color: colors.primary,
    },
    previewText: {
      fontSize: 18,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
      borderRadius: 8,
      textAlign: "center",
    },
    sizeContainer: {
      marginBottom: 24,
    },
    sizeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    sizeItem: {
      width: "48%",
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      alignItems: "center",
    },
    selectedSize: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    sizeText: {
      ...getTextStyle("body", "medium"),
      color: colors.text,
    },
    selectedSizeText: {
      color: colors.primary,
    },
    previewContainer: {
      marginTop: 16,
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 8,
    },
    previewLabel: {
      ...getTextStyle("caption"),
      color: colors.textSecondary,
      marginBottom: 8,
    },
  });

  const renderArabicFonts = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>{t("arabicFonts")}</Text>
      {arabicFonts.map((fontKey) => {
        const font = fontFamilies[fontKey];
        const isSelected = arabicFontFamily === fontKey;

        return (
          <TouchableOpacity
            key={fontKey}
            style={styles.fontItem}
            onPress={() => handleArabicFontChange(fontKey)}
          >
            <View style={styles.fontHeader}>
              <Text style={styles.fontName}>{font.name}</Text>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary}
                />
              )}
            </View>

            <Text
              style={[
                styles.previewText,
                {
                  fontFamily:
                    font.fontFamily === "System" ? undefined : font.fontFamily,
                  textAlign: "right",
                  color: colors.text,
                },
              ]}
            >
              {previewTextArabic}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderBengaliFonts = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>{t("bengaliFonts")}</Text>
      {bengaliFonts.map((fontKey) => {
        const font = fontFamilies[fontKey];
        const isSelected = bengaliFontFamily === fontKey;

        return (
          <TouchableOpacity
            key={fontKey}
            style={styles.fontItem}
            onPress={() => handleBengaliFontChange(fontKey)}
          >
            <View style={styles.fontHeader}>
              <Text style={styles.fontName}>{font.name}</Text>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary}
                />
              )}
            </View>

            <Text
              style={[
                styles.previewText,
                {
                  fontFamily:
                    font.fontFamily === "System" ? undefined : font.fontFamily,
                  color: colors.text,
                },
              ]}
            >
              {previewTextBengali}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderFontSizes = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>{t("fontSize")}</Text>

      <View style={styles.sizeGrid}>
        {Object.keys(fontSizes).map((sizeKey) => {
          const size = fontSizes[sizeKey];
          const isSelected = fontSize === sizeKey;

          return (
            <TouchableOpacity
              key={sizeKey}
              style={[styles.sizeItem, isSelected && styles.selectedSize]}
              onPress={() => changeFontSize(sizeKey)}
            >
              <Text
                style={[styles.sizeText, isSelected && styles.selectedSizeText]}
              >
                {size.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.previewContainer}>
        <Text style={styles.previewLabel}>{t("preview")}</Text>
        <Text style={[getArabicTextStyle(), { color: colors.text }]}>
          {previewTextArabic}
        </Text>
        <Text
          style={[getBengaliTextStyle(), { color: colors.text, marginTop: 8 }]}
        >
          {previewTextBengali}
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t("fontSettings")}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "arabic" && styles.activeTab]}
              onPress={() => setActiveTab("arabic")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "arabic" && styles.activeTabText,
                ]}
              >
                {t("arabic")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "bengali" && styles.activeTab]}
              onPress={() => setActiveTab("bengali")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "bengali" && styles.activeTabText,
                ]}
              >
                {t("bengali")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "size" && styles.activeTab]}
              onPress={() => setActiveTab("size")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "size" && styles.activeTabText,
                ]}
              >
                {t("size")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {activeTab === "arabic" && renderArabicFonts()}
            {activeTab === "bengali" && renderBengaliFonts()}
            {activeTab === "size" && renderFontSizes()}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FontSelectionModal;
