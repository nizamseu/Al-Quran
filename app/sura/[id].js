import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  Dimensions,
  Share,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// Context Imports
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useFont } from "../../contexts/FontContext";
import { useSettings } from "../../contexts/SettingsContext";

// Service Imports
import dataService from "../../services/dataService";

const { width: screenWidth } = Dimensions.get("window");

export default function SuraDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const soundRef = useRef(null);

  // Context hooks
  const { colors, isDark } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const {
    getTextStyle,
    fontSize,
    fontFamily,
    fontFamilies,
    fontSizes,
    changeFontFamily,
    changeFontSize,
  } = useFont();
  const {
    settings,
    updateLastRead,
    toggleBookmark,
    isBookmarked,
    updateReadingProgress,
  } = useSettings();

  // State
  const [loading, setLoading] = useState(true);
  const [sura, setSura] = useState(null);
  const [verses, setVerses] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [tafsir, setTafsir] = useState([]);
  const [currentTranslation, setCurrentTranslation] = useState(null);
  const [currentTafsir, setCurrentTafsir] = useState(null);
  const [showTranslations, setShowTranslations] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playingVerse, setPlayingVerse] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [showVerseActions, setShowVerseActions] = useState(false);
  const [readingMode, setReadingMode] = useState(
    settings.readingMode || "translation"
  );

  const suraId = parseInt(id);

  // Font helper functions
  const getArabicFont = () => {
    const arabicFonts = [
      "QPC Hafs Font",
      "QPC V1 Font",
      "Indopak Nastaleeq Font",
      "KFGQPC Nastaleeq",
      "Amiri",
      "System",
    ];

    // You can add logic here to select based on user preference
    // For now, return the first available font
    return arabicFonts[0];
  };

  const getBengaliFont = () => {
    const bengaliFonts = [
      "NotoSansBengali-Regular",
      "NotoSansBengali",
      "Kalpurush",
      "SolaimanLipi",
      "System",
    ];

    return bengaliFonts[0];
  };

  useEffect(() => {
    loadSuraData();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [suraId, currentLanguage]);

  useEffect(() => {
    // Update last read when component mounts
    if (sura) {
      updateLastRead(suraId, sura.nameSimple);
    }
  }, [sura]);

  const loadSuraData = async () => {
    try {
      setLoading(true);

      // Get sura info
      const suraInfo = dataService.getSuraById(suraId);
      if (!suraInfo) {
        Alert.alert("Error", "Sura not found");
        return;
      }
      setSura(suraInfo);

      // Get verses
      const suraVerses = dataService.getVersesForSura(suraId);
      setVerses(suraVerses);

      // Get available translations
      const availableTranslations =
        dataService.getAvailableTranslations(currentLanguage);
      console.log("Available translations:", availableTranslations);
      setTranslations(availableTranslations);

      // Set default translation
      if (availableTranslations.length > 0 && !currentTranslation) {
        setCurrentTranslation(availableTranslations[0]);
        console.log("Set default translation:", availableTranslations[0]);
      }

      // Get available tafsir
      const availableTafsir = dataService.getAvailableTafsir(currentLanguage);
      console.log("Available tafsir:", availableTafsir);
      setTafsir(availableTafsir);

      // Set default tafsir
      if (availableTafsir.length > 0 && !currentTafsir) {
        setCurrentTafsir(availableTafsir[0]);
        console.log("Set default tafsir:", availableTafsir[0]);
      }
    } catch (error) {
      console.error("Error loading sura data:", error);
      Alert.alert("Error", "Failed to load sura data");
    } finally {
      setLoading(false);
    }
  };

  const handleVersePress = (verse) => {
    setSelectedVerse(verse);
    setShowVerseActions(true);
  };

  const handlePlayVerse = async (verseNumber) => {
    try {
      // Stop current audio if playing
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // If clicking the same verse that's playing, stop it
      if (playingVerse === verseNumber && isPlaying) {
        setIsPlaying(false);
        setPlayingVerse(null);
        return;
      }

      // For now, just simulate audio playback since recitation data is not available
      setPlayingVerse(verseNumber);
      setIsPlaying(true);

      // Simulate audio duration (remove this when real audio is implemented)
      setTimeout(() => {
        setIsPlaying(false);
        setPlayingVerse(null);
      }, 3000); // 3 seconds simulation

      Alert.alert(
        "Audio",
        `Playing verse ${verseNumber}. Audio files need to be implemented.`
      );
    } catch (error) {
      console.error("Error playing verse:", error);
      Alert.alert("Error", "Failed to play verse audio.");
      setIsPlaying(false);
      setPlayingVerse(null);
    }
  };

  const handleShareVerse = async (verse) => {
    try {
      const translationText = currentTranslation
        ? dataService.getTranslation(
            verse.verseKey,
            currentLanguage,
            currentTranslation.id
          )
        : "";

      const message = `${sura.nameSimple} (${suraId}:${verse.ayahNumber})
${verse.text}${translationText ? "\n\n" + translationText : ""}

Shared from Al-Quran App`;

      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error("Error sharing verse:", error);
    }
  };

  const handleCopyVerse = async (verse) => {
    // Implementation for copying verse to clipboard
    Alert.alert("Copied", "Verse copied to clipboard");
  };

  const renderVerse = (verse) => {
    const verseTranslation = currentTranslation
      ? dataService.getTranslation(
          verse.verseKey,
          currentLanguage,
          currentTranslation.id
        )
      : null;

    const verseTafsir = currentTafsir
      ? dataService.getTafsir(verse.verseKey, currentLanguage, currentTafsir.id)
      : null;

    // Debug logging
    console.log("Verse:", verse.verseKey);
    console.log("Current translation:", currentTranslation);
    console.log("Translation result:", verseTranslation);
    console.log("Current tafsir:", currentTafsir);
    console.log("Tafsir result:", verseTafsir);

    return (
      <View
        key={verse.id}
        style={{
          backgroundColor: colors.surface,
          marginHorizontal: 16,
          marginVertical: 8,
          borderRadius: 12,
          padding: 16,
          shadowColor: isDark ? colors.text : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {/* Verse Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              {verse.ayahNumber}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={{
                padding: 8,
                borderRadius: 20,
                backgroundColor:
                  playingVerse === verse.ayahNumber
                    ? colors.primary + "30"
                    : colors.primaryLight + "20",
              }}
              onPress={() => handlePlayVerse(verse.ayahNumber)}
            >
              <Ionicons
                name={
                  playingVerse === verse.ayahNumber && isPlaying
                    ? "pause"
                    : "play"
                }
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                padding: 8,
                borderRadius: 20,
                backgroundColor: colors.primaryLight + "20",
              }}
              onPress={() => handleVersePress(verse)}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Arabic Text */}
        <Text
          style={{
            fontSize:
              fontSize === "small" ? 20 : fontSize === "medium" ? 24 : 28,
            lineHeight:
              fontSize === "small" ? 32 : fontSize === "medium" ? 38 : 44,
            textAlign: "right",
            color: colors.text,
            marginBottom: 16,
            fontFamily: getArabicFont(),
          }}
        >
          {verse.text}
        </Text>

        {/* Translation */}
        {(readingMode === "translation" || readingMode === "both") && (
          <View
            style={{
              backgroundColor: colors.primaryLight + "10",
              padding: 12,
              borderRadius: 8,
              marginBottom: 12,
              borderLeftWidth: 3,
              borderLeftColor: colors.primary,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: colors.primary,
                fontWeight: "600",
                marginBottom: 4,
              }}
            >
              Translation (
              {currentTranslation?.name || "No translation selected"})
            </Text>
            <Text
              style={{
                fontSize: 16,
                lineHeight: 24,
                color: colors.text,
                fontFamily:
                  currentLanguage === "bn" ? getBengaliFont() : "System",
              }}
            >
              {verseTranslation || "Translation not available for this verse"}
            </Text>
          </View>
        )}

        {/* Tafsir */}
        {(readingMode === "tafsir" || readingMode === "both") && (
          <View
            style={{
              backgroundColor: colors.warning + "10",
              padding: 12,
              borderRadius: 8,
              borderLeftWidth: 3,
              borderLeftColor: colors.warning,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: colors.warning,
                fontWeight: "600",
                marginBottom: 4,
              }}
            >
              Tafsir ({currentTafsir?.name || "No tafsir selected"})
            </Text>
            <Text
              style={{
                fontSize: 15,
                lineHeight: 22,
                color: colors.text,
                fontFamily:
                  currentLanguage === "bn" ? getBengaliFont() : "System",
              }}
            >
              {verseTafsir || "Tafsir not available for this verse"}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderSuraHeader = () => (
    <View
      style={{
        backgroundColor: colors.surface,
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {/* Sura Info */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 16,
            color: colors.primary,
            fontWeight: "bold",
            marginBottom: 8,
          }}
        >
          Sura {sura.id}
        </Text>

        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: colors.text,
            textAlign: "center",
            marginBottom: 4,
            ...getTextStyle("title", "bold"),
          }}
        >
          {currentLanguage === "bn" ? sura.nameBengali : sura.nameSimple}
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: colors.textSecondary,
            marginBottom: 12,
          }}
        >
          {sura.nameArabic}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <View
            style={{
              backgroundColor: colors.primaryLight,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <Text
              style={{ color: colors.primary, fontSize: 12, fontWeight: "500" }}
            >
              {sura.versesCount} verses
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.primaryLight,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <Text
              style={{ color: colors.primary, fontSize: 12, fontWeight: "500" }}
            >
              {sura.revelationPlace === "makkah" ? "Meccan" : "Medinan"}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <TouchableOpacity
          style={{
            alignItems: "center",
            padding: 8,
          }}
          onPress={() => toggleBookmark(suraId, sura.nameSimple)}
        >
          <Ionicons
            name={isBookmarked(suraId) ? "bookmark" : "bookmark-outline"}
            size={24}
            color={isBookmarked(suraId) ? colors.primary : colors.textSecondary}
          />
          <Text
            style={{
              color: isBookmarked(suraId)
                ? colors.primary
                : colors.textSecondary,
              fontSize: 12,
              marginTop: 4,
            }}
          >
            {isBookmarked(suraId) ? "Bookmarked" : "Bookmark"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            alignItems: "center",
            padding: 8,
          }}
          onPress={() => setShowTranslations(true)}
        >
          <Ionicons name="language" size={24} color={colors.textSecondary} />
          <Text
            style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}
          >
            Translation
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            alignItems: "center",
            padding: 8,
          }}
          onPress={() => setShowTafsir(true)}
        >
          <MaterialIcons name="school" size={24} color={colors.textSecondary} />
          <Text
            style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}
          >
            Tafsir
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            alignItems: "center",
            padding: 8,
          }}
          onPress={() => setShowSettings(true)}
        >
          <Ionicons name="settings" size={24} color={colors.textSecondary} />
          <Text
            style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTranslationModal = () => (
    <Modal
      visible={showTranslations}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTranslations(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 20,
            maxHeight: "70%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              style={{
                ...getTextStyle("title", "bold"),
                color: colors.text,
              }}
            >
              Select Translation
            </Text>
            <TouchableOpacity onPress={() => setShowTranslations(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={translations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  backgroundColor:
                    currentTranslation?.id === item.id
                      ? colors.primaryLight + "20"
                      : "transparent",
                }}
                onPress={() => {
                  setCurrentTranslation(item);
                  setShowTranslations(false);
                }}
              >
                <Text
                  style={{
                    ...getTextStyle("subtitle", "medium"),
                    color:
                      currentTranslation?.id === item.id
                        ? colors.primary
                        : colors.text,
                  }}
                >
                  {item.name}
                </Text>
                {currentTranslation?.id === item.id && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderTafsirModal = () => (
    <Modal
      visible={showTafsir}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTafsir(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 20,
            maxHeight: "70%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              style={{
                ...getTextStyle("title", "bold"),
                color: colors.text,
              }}
            >
              Select Tafsir
            </Text>
            <TouchableOpacity onPress={() => setShowTafsir(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={tafsir}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  backgroundColor:
                    currentTafsir?.id === item.id
                      ? colors.primaryLight + "20"
                      : "transparent",
                }}
                onPress={() => {
                  setCurrentTafsir(item);
                  setShowTafsir(false);
                }}
              >
                <Text
                  style={{
                    ...getTextStyle("subtitle", "medium"),
                    color:
                      currentTafsir?.id === item.id
                        ? colors.primary
                        : colors.text,
                  }}
                >
                  {item.name}
                </Text>
                {currentTafsir?.id === item.id && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={showSettings}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSettings(false)}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: "80%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colors.text,
                ...getTextStyle("title", "bold"),
              }}
            >
              Reading Settings
            </Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Reading Mode */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 12,
                ...getTextStyle("subtitle", "bold"),
              }}
            >
              Reading Mode
            </Text>

            {["translation", "tafsir", "both"].map((mode) => (
              <TouchableOpacity
                key={mode}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor:
                    readingMode === mode
                      ? colors.primaryLight + "20"
                      : "transparent",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
                onPress={() => setReadingMode(mode)}
              >
                <Ionicons
                  name={
                    readingMode === mode
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={
                    readingMode === mode ? colors.primary : colors.textSecondary
                  }
                />
                <Text
                  style={{
                    marginLeft: 12,
                    color: readingMode === mode ? colors.primary : colors.text,
                    ...getTextStyle("body"),
                    textTransform: "capitalize",
                  }}
                >
                  {mode === "both" ? "Translation & Tafsir" : mode}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Font Family */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginTop: 20,
                marginBottom: 12,
                ...getTextStyle("subtitle", "bold"),
              }}
            >
              Arabic Font Family
            </Text>

            {Object.entries(fontFamilies).map(([key, font]) => (
              <TouchableOpacity
                key={key}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor:
                    fontFamily === key
                      ? colors.primaryLight + "20"
                      : "transparent",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
                onPress={() => changeFontFamily(key)}
              >
                <Ionicons
                  name={
                    fontFamily === key ? "radio-button-on" : "radio-button-off"
                  }
                  size={20}
                  color={
                    fontFamily === key ? colors.primary : colors.textSecondary
                  }
                />
                <Text
                  style={{
                    marginLeft: 12,
                    color: fontFamily === key ? colors.primary : colors.text,
                    ...getTextStyle("body"),
                  }}
                >
                  {font.name}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Font Size */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginTop: 20,
                marginBottom: 12,
                ...getTextStyle("subtitle", "bold"),
              }}
            >
              Font Size
            </Text>

            {Object.entries(fontSizes).map(([key, size]) => (
              <TouchableOpacity
                key={key}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor:
                    fontSize === key
                      ? colors.primaryLight + "20"
                      : "transparent",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
                onPress={() => changeFontSize(key)}
              >
                <Ionicons
                  name={
                    fontSize === key ? "radio-button-on" : "radio-button-off"
                  }
                  size={20}
                  color={
                    fontSize === key ? colors.primary : colors.textSecondary
                  }
                />
                <Text
                  style={{
                    marginLeft: 12,
                    color: fontSize === key ? colors.primary : colors.text,
                    ...getTextStyle("body"),
                  }}
                >
                  {size.name}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Current Translation */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginTop: 20,
                marginBottom: 12,
                ...getTextStyle("subtitle", "bold"),
              }}
            >
              Current Translation
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: colors.primaryLight + "10",
                borderRadius: 8,
                marginBottom: 12,
              }}
              onPress={() => {
                setShowSettings(false);
                setShowTranslations(true);
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  ...getTextStyle("body"),
                }}
              >
                {currentTranslation?.name || "Select Translation"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>

            {/* Current Tafsir */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 12,
                ...getTextStyle("subtitle", "bold"),
              }}
            >
              Current Tafsir
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: colors.primaryLight + "10",
                borderRadius: 8,
                marginBottom: 20,
              }}
              onPress={() => {
                setShowSettings(false);
                setShowTafsir(true);
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  ...getTextStyle("body"),
                }}
              >
                {currentTafsir?.name || "Select Tafsir"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderVerseActionsModal = () => (
    <Modal
      visible={showVerseActions}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowVerseActions(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                ...getTextStyle("title", "bold"),
                color: colors.text,
              }}
            >
              Verse Actions
            </Text>
            <TouchableOpacity onPress={() => setShowVerseActions(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 16,
              paddingHorizontal: 12,
              borderRadius: 8,
              marginBottom: 8,
            }}
            onPress={() => {
              if (selectedVerse) {
                handleShareVerse(selectedVerse);
              }
              setShowVerseActions(false);
            }}
          >
            <Ionicons name="share-outline" size={24} color={colors.primary} />
            <Text
              style={{
                ...getTextStyle("subtitle", "medium"),
                marginLeft: 16,
                color: colors.text,
              }}
            >
              Share
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 16,
              paddingHorizontal: 12,
              borderRadius: 8,
              marginBottom: 8,
            }}
            onPress={() => {
              if (selectedVerse) {
                handleCopyVerse(selectedVerse);
              }
              setShowVerseActions(false);
            }}
          >
            <Ionicons name="copy-outline" size={24} color={colors.primary} />
            <Text
              style={{
                ...getTextStyle("subtitle", "medium"),
                marginLeft: 16,
                color: colors.text,
              }}
            >
              Copy
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={{
            color: colors.text,
            marginTop: 16,
            ...getTextStyle("body"),
          }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  if (!sura) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            color: colors.error,
            textAlign: "center",
            ...getTextStyle("body"),
          }}
        >
          Sura not found
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        backgroundColor={colors.surface}
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {renderSuraHeader()}

        {verses.map((verse) => renderVerse(verse))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {renderTranslationModal()}
      {renderTafsirModal()}
      {renderSettingsModal()}
      {renderVerseActionsModal()}
    </View>
  );
}
