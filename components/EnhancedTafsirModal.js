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
  Share,
  Clipboard,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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
  selectedTranslations,
  suraName,
}) => {
  const { colors } = useTheme();
  const { getTextStyle, getBengaliTextStyle } = useFont();
  const { t, currentLanguage } = useLanguage();

  const [tafsirData, setTafsirData] = useState([]);
  const [translationData, setTranslationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTafsirIndex, setSelectedTafsirIndex] = useState(0);
  const [selectedTranslationIndex, setSelectedTranslationIndex] = useState(0);
  const [showAllTafsir, setShowAllTafsir] = useState(false);
  const [showAllTranslations, setShowAllTranslations] = useState(false);

  useEffect(() => {
    if (
      visible &&
      (selectedTafsir?.length > 0 || selectedTranslations?.length > 0)
    ) {
      loadTafsirData();
      loadTranslationData();
    }
  }, [visible, selectedTafsir, selectedTranslations, suraId, ayahNumber]);

  const loadTafsirData = async () => {
    setLoading(true);
    try {
      const tafsirResults = [];

      for (const tafsir of selectedTafsir || []) {
        const verseKey = `${suraId}:${ayahNumber}`;
        const tafsirText = dataService.getTafsir(
          verseKey,
          currentLanguage,
          tafsir.id
        );

        if (tafsirText) {
          tafsirResults.push({
            ...tafsir,
            content: tafsirText,
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
      const translationResults = [];

      for (const translation of selectedTranslations || []) {
        const verseKey = `${suraId}:${ayahNumber}`;
        const translationText = dataService.getTranslation(
          verseKey,
          currentLanguage,
          translation.id
        );

        if (translationText) {
          translationResults.push({
            ...translation,
            content: translationText,
          });
        }
      }

      setTranslationData(translationResults);
    } catch (error) {
      console.error("Error loading translation data:", error);
    }
  };

  const handleShare = (content, source, type = "tafsir") => {
    const message = `${suraName} (${suraId}:${ayahNumber})
    
${type.toUpperCase()}: ${source}
${content}

Shared from Al-Quran App`;

    Share.share({ message });
  };

  const handleCopy = (content, source, type = "tafsir") => {
    const text = `${suraName} (${suraId}:${ayahNumber})
    
${type.toUpperCase()}: ${source}
${content}`;

    Clipboard.setString(text);
    Alert.alert("Copied", `${type} copied to clipboard`);
  };

  const nextTafsir = () => {
    if (selectedTafsirIndex < tafsirData.length - 1) {
      setSelectedTafsirIndex(selectedTafsirIndex + 1);
    } else {
      setSelectedTafsirIndex(0);
    }
  };

  const previousTafsir = () => {
    if (selectedTafsirIndex > 0) {
      setSelectedTafsirIndex(selectedTafsirIndex - 1);
    } else {
      setSelectedTafsirIndex(tafsirData.length - 1);
    }
  };

  const nextTranslation = () => {
    if (selectedTranslationIndex < translationData.length - 1) {
      setSelectedTranslationIndex(selectedTranslationIndex + 1);
    } else {
      setSelectedTranslationIndex(0);
    }
  };

  const previousTranslation = () => {
    if (selectedTranslationIndex > 0) {
      setSelectedTranslationIndex(selectedTranslationIndex - 1);
    } else {
      setSelectedTranslationIndex(translationData.length - 1);
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

  const renderTranslationSection = () => {
    if (translationData.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Translation</Text>
          <View style={styles.navigationButtons}>
            {translationData.length > 1 && (
              <>
                <TouchableOpacity
                  onPress={previousTranslation}
                  style={styles.navButton}
                >
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <Text style={styles.counterText}>
                  {selectedTranslationIndex + 1}/{translationData.length}
                </Text>
                <TouchableOpacity
                  onPress={nextTranslation}
                  style={styles.navButton}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {translationData[selectedTranslationIndex] && (
          <View style={styles.contentCard}>
            <View style={styles.contentHeader}>
              <Text style={styles.sourceName}>
                {translationData[selectedTranslationIndex].name}
              </Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() =>
                    handleShare(
                      translationData[selectedTranslationIndex].content,
                      translationData[selectedTranslationIndex].name,
                      "translation"
                    )
                  }
                  style={styles.actionButton}
                >
                  <Ionicons
                    name="share-outline"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    handleCopy(
                      translationData[selectedTranslationIndex].content,
                      translationData[selectedTranslationIndex].name,
                      "translation"
                    )
                  }
                  style={styles.actionButton}
                >
                  <Ionicons
                    name="copy-outline"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.contentText}>
              {translationData[selectedTranslationIndex].content}
            </Text>
          </View>
        )}

        {showAllTranslations && translationData.length > 1 && (
          <View style={styles.allContentContainer}>
            {translationData.map((translation, index) => (
              <View key={translation.id} style={styles.contentCard}>
                <View style={styles.contentHeader}>
                  <Text style={styles.sourceName}>{translation.name}</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      onPress={() =>
                        handleShare(
                          translation.content,
                          translation.name,
                          "translation"
                        )
                      }
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="share-outline"
                        size={20}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        handleCopy(
                          translation.content,
                          translation.name,
                          "translation"
                        )
                      }
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="copy-outline"
                        size={20}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.contentText}>{translation.content}</Text>
              </View>
            ))}
          </View>
        )}

        {translationData.length > 1 && (
          <TouchableOpacity
            onPress={() => setShowAllTranslations(!showAllTranslations)}
            style={styles.showAllButton}
          >
            <Text style={styles.showAllText}>
              {showAllTranslations ? "Show Single" : "Show All Translations"}
            </Text>
            <Ionicons
              name={showAllTranslations ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderTafsirSection = () => {
    if (tafsirData.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tafsir</Text>
          <View style={styles.navigationButtons}>
            {tafsirData.length > 1 && (
              <>
                <TouchableOpacity
                  onPress={previousTafsir}
                  style={styles.navButton}
                >
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <Text style={styles.counterText}>
                  {selectedTafsirIndex + 1}/{tafsirData.length}
                </Text>
                <TouchableOpacity onPress={nextTafsir} style={styles.navButton}>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {tafsirData[selectedTafsirIndex] && (
          <View style={styles.contentCard}>
            <View style={styles.contentHeader}>
              <Text style={styles.sourceName}>
                {tafsirData[selectedTafsirIndex].name}
              </Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() =>
                    handleShare(
                      tafsirData[selectedTafsirIndex].content,
                      tafsirData[selectedTafsirIndex].name,
                      "tafsir"
                    )
                  }
                  style={styles.actionButton}
                >
                  <Ionicons
                    name="share-outline"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    handleCopy(
                      tafsirData[selectedTafsirIndex].content,
                      tafsirData[selectedTafsirIndex].name,
                      "tafsir"
                    )
                  }
                  style={styles.actionButton}
                >
                  <Ionicons
                    name="copy-outline"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView
              style={styles.scrollableContent}
              showsVerticalScrollIndicator={true}
              persistentScrollbar={true}
            >
              <Text style={styles.contentText}>
                {cleanHtmlText(tafsirData[selectedTafsirIndex].content)}
              </Text>
            </ScrollView>
          </View>
        )}

        {showAllTafsir && tafsirData.length > 1 && (
          <ScrollView style={styles.allContentContainer}>
            {tafsirData.map((tafsir, index) => (
              <View key={tafsir.id} style={styles.contentCard}>
                <View style={styles.contentHeader}>
                  <Text style={styles.sourceName}>{tafsir.name}</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      onPress={() =>
                        handleShare(tafsir.content, tafsir.name, "tafsir")
                      }
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="share-outline"
                        size={20}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        handleCopy(tafsir.content, tafsir.name, "tafsir")
                      }
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="copy-outline"
                        size={20}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.contentText}>
                  {cleanHtmlText(tafsir.content)}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}

        {tafsirData.length > 1 && (
          <TouchableOpacity
            onPress={() => setShowAllTafsir(!showAllTafsir)}
            style={styles.showAllButton}
          >
            <Text style={styles.showAllText}>
              {showAllTafsir ? "Show Single" : "Show All Tafsir"}
            </Text>
            <Ionicons
              name={showAllTafsir ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    );
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
    headerTitle: {
      ...getTextStyle("title", "bold"),
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    verseInfo: {
      backgroundColor: colors.primaryLight + "20",
      margin: 16,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    verseInfoText: {
      ...getTextStyle("body", "medium"),
      color: colors.primary,
    },
    section: {
      margin: 16,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      ...getTextStyle("subtitle", "bold"),
      color: colors.text,
    },
    navigationButtons: {
      flexDirection: "row",
      alignItems: "center",
    },
    navButton: {
      padding: 8,
    },
    counterText: {
      ...getTextStyle("caption"),
      color: colors.textSecondary,
      marginHorizontal: 8,
    },
    contentCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    contentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sourceName: {
      ...getTextStyle("subtitle", "medium"),
      color: colors.primary,
      flex: 1,
    },
    actionButtons: {
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      padding: 8,
      borderRadius: 16,
      backgroundColor: colors.primaryLight + "20",
    },
    contentText: {
      ...getTextStyle("body"),
      color: colors.text,
      lineHeight: 24,
    },
    scrollableContent: {
      maxHeight: 300,
    },
    allContentContainer: {
      maxHeight: 400,
    },
    showAllButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      backgroundColor: colors.primaryLight + "20",
      borderRadius: 8,
      marginTop: 8,
    },
    showAllText: {
      ...getTextStyle("body", "medium"),
      color: colors.primary,
      marginRight: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    loadingText: {
      ...getTextStyle("body"),
      color: colors.textSecondary,
      marginTop: 16,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Verse Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.verseInfo}>
            <Text style={styles.verseInfoText}>
              {suraName} • Ayah {ayahNumber}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderTranslationSection()}
              {renderTafsirSection()}

              {tafsirData.length === 0 && translationData.length === 0 && (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>
                    No content available for this verse
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default TafsirModal;
