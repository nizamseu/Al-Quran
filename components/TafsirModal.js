import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useFont } from "../contexts/FontContext";
import { useLanguage } from "../contexts/LanguageContext";
import dataService from "../services/dataService";

const { width, height } = Dimensions.get("window");

const TafsirModal = ({
  visible,
  onClose,
  suraId,
  ayahNumber,
  selectedTafsir,
  suraName,
}) => {
  const { colors } = useTheme();
  const { getTextStyle, getBengaliTextStyle } = useFont();
  const { t, currentLanguage } = useLanguage();

  const [tafsirData, setTafsirData] = useState(null);
  const [translationData, setTranslationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTafsirSource, setSelectedTafsirSource] = useState(0);

  useEffect(() => {
    if (visible && selectedTafsir.length > 0) {
      loadTafsirData();
      loadTranslationData();
    }
  }, [visible, selectedTafsir, suraId, ayahNumber]);

  const loadTafsirData = async () => {
    setLoading(true);
    try {
      const tafsirResults = [];

      for (const tafsir of selectedTafsir) {
        const tafsirResult = dataService.getTafsirWithRange(
          suraId,
          ayahNumber,
          tafsir.id
        );
        if (tafsirResult.text) {
          tafsirResults.push({
            ...tafsir,
            content: tafsirResult.text,
            ayahKeys: tafsirResult.ayahKeys,
            hasRange: tafsirResult.hasRange,
          });
        }
      }

      setTafsirData(tafsirResults);
    } catch (error) {
      console.error("Error loading tafsir data:", error);
      Alert.alert("Error", "Failed to load tafsir data");
    } finally {
      setLoading(false);
    }
  };

  const loadTranslationData = async () => {
    try {
      // Load default translation for context
      const availableTranslations =
        dataService.getAvailableTranslations(currentLanguage);
      if (availableTranslations.length > 0) {
        const translation = dataService.getTranslation(
          suraId,
          ayahNumber,
          availableTranslations[0].id
        );
        setTranslationData({
          text: translation,
          source: availableTranslations[0].name,
        });
      }
    } catch (error) {
      console.error("Error loading translation data:", error);
    }
  };

  const handleAyahRangePress = (ayahKeys) => {
    if (ayahKeys && ayahKeys.length > 0) {
      Alert.alert(
        t("ayahRange"),
        `${t("thisTafsirCovers")}: ${ayahKeys.join(", ")}`,
        [
          { text: t("ok"), style: "default" },
          {
            text: t("viewRange"),
            onPress: () => {
              // You can implement navigation to show the range of ayahs
              console.log("Navigate to ayah range:", ayahKeys);
            },
          },
        ]
      );
    }
  };

  const cleanHtmlText = (htmlText) => {
    if (!htmlText) return "";

    // Simple HTML tag removal - in a real app, you might want to use a proper HTML parser
    return htmlText
      .replace(/<[^>]*>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/g, " ")
      .trim();
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
    headerLeft: {
      flex: 1,
    },
    title: {
      ...getTextStyle("title", "bold"),
      color: colors.text,
    },
    subtitle: {
      ...getTextStyle("caption"),
      color: colors.textSecondary,
      marginTop: 2,
    },
    closeButton: {
      padding: 8,
    },
    content: {
      flex: 1,
    },
    translationSection: {
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    translationTitle: {
      ...getTextStyle("subtitle", "medium"),
      color: colors.primary,
      marginBottom: 8,
    },
    translationText: {
      ...(currentLanguage === "bn"
        ? getBengaliTextStyle()
        : getTextStyle("body")),
      color: colors.text,
      lineHeight: 24,
    },
    translationSource: {
      ...getTextStyle("caption"),
      color: colors.textSecondary,
      marginTop: 8,
      fontStyle: "italic",
    },
    tafsirContainer: {
      flex: 1,
    },
    tafsirTabs: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tafsirTabsScroll: {
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    tafsirTab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activeTafsirTab: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tafsirTabText: {
      ...getTextStyle("caption"),
      color: colors.textSecondary,
    },
    activeTafsirTabText: {
      color: "white",
      fontWeight: "bold",
    },
    tafsirContent: {
      flex: 1,
      padding: 20,
    },
    rangeIndicator: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primaryLight,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      marginBottom: 16,
    },
    rangeText: {
      ...getTextStyle("caption", "medium"),
      color: colors.primary,
      marginLeft: 4,
    },
    tafsirText: {
      ...(currentLanguage === "bn"
        ? getBengaliTextStyle()
        : getTextStyle("body")),
      color: colors.text,
      lineHeight: 28,
      textAlign: currentLanguage === "bn" ? "left" : "justify",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      ...getTextStyle("body"),
      color: colors.textSecondary,
      marginTop: 16,
    },
    noDataContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    noDataText: {
      ...getTextStyle("body"),
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: 16,
    },
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>{t("tafsir")}</Text>
              <Text style={styles.subtitle}>
                {suraName} - {t("ayah")} {ayahNumber}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Translation Section */}
          {translationData && (
            <View style={styles.translationSection}>
              <Text style={styles.translationTitle}>{t("translation")}</Text>
              <Text style={styles.translationText}>{translationData.text}</Text>
              <Text style={styles.translationSource}>
                - {translationData.source}
              </Text>
            </View>
          )}

          {/* Tafsir Content */}
          <View style={styles.tafsirContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Ionicons
                  name="hourglass"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text style={styles.loadingText}>{t("loading")}</Text>
              </View>
            ) : !tafsirData || tafsirData.length === 0 ? (
              <View style={styles.noDataContainer}>
                <Ionicons
                  name="book-outline"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text style={styles.noDataText}>{t("noTafsirAvailable")}</Text>
              </View>
            ) : (
              <>
                {/* Tafsir Tabs */}
                {tafsirData.length > 1 && (
                  <View style={styles.tafsirTabs}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.tafsirTabsScroll}
                    >
                      {tafsirData.map((tafsir, index) => (
                        <TouchableOpacity
                          key={tafsir.id}
                          style={[
                            styles.tafsirTab,
                            selectedTafsirSource === index &&
                              styles.activeTafsirTab,
                          ]}
                          onPress={() => setSelectedTafsirSource(index)}
                        >
                          <Text
                            style={[
                              styles.tafsirTabText,
                              selectedTafsirSource === index &&
                                styles.activeTafsirTabText,
                            ]}
                          >
                            {tafsir.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Selected Tafsir Content */}
                <ScrollView
                  style={styles.tafsirContent}
                  showsVerticalScrollIndicator={false}
                >
                  {tafsirData[selectedTafsirSource]?.hasRange && (
                    <TouchableOpacity
                      style={styles.rangeIndicator}
                      onPress={() =>
                        handleAyahRangePress(
                          tafsirData[selectedTafsirSource].ayahKeys
                        )
                      }
                    >
                      <Ionicons
                        name="information-circle"
                        size={16}
                        color={colors.primary}
                      />
                      <Text style={styles.rangeText}>
                        {t("coversMultipleAyahs")} (
                        {tafsirData[selectedTafsirSource].ayahKeys?.length || 0}
                        )
                      </Text>
                    </TouchableOpacity>
                  )}

                  <Text style={styles.tafsirText}>
                    {cleanHtmlText(tafsirData[selectedTafsirSource]?.content)}
                  </Text>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TafsirModal;
