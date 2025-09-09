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
import { useAudio } from "../../contexts/AudioContext";

// Service Imports
import dataService from "../../services/dataService";

// Component Imports
import MultipleTranslationSelector from "../../components/MultipleTranslationSelector";
import MultipleTafsirSelector from "../../components/MultipleTafsirSelector";
import TafsirModal from "../../components/TafsirModal";
import FontSelectionModal from "../../components/FontSelectionModal";

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
    getArabicTextStyle,
    getBengaliTextStyle,
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
  const {
    playSura,
    playAyah,
    currentTrack,
    isPlaying: audioIsPlaying,
  } = useAudio();

  // State
  const [loading, setLoading] = useState(true);
  const [sura, setSura] = useState(null);
  const [verses, setVerses] = useState([]);
  const [availableTranslations, setAvailableTranslations] = useState([]);
  const [availableTafsir, setAvailableTafsir] = useState([]);
  const [selectedTranslations, setSelectedTranslations] = useState([]);
  const [selectedTafsir, setSelectedTafsir] = useState([]);
  const [showTranslationSelector, setShowTranslationSelector] = useState(false);
  const [showTafsirSelector, setShowTafsirSelector] = useState(false);
  const [showTafsirModal, setShowTafsirModal] = useState(false);
  const [showFontModal, setShowFontModal] = useState(false);
  const [selectedVerseForTafsir, setSelectedVerseForTafsir] = useState(null);
  const [playingVerse, setPlayingVerse] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [showVerseActions, setShowVerseActions] = useState(false);
  const [readingMode, setReadingMode] = useState(
    settings.readingMode || "translation"
  );

  const suraId = parseInt(id);

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
      const translations =
        dataService.getAvailableTranslations(currentLanguage);
      console.log("Available translations:", translations);
      setAvailableTranslations(translations);

      // Set default translation if none selected
      if (translations.length > 0 && selectedTranslations.length === 0) {
        setSelectedTranslations([translations[0]]);
        console.log("Set default translation:", translations[0]);
      }

      // Get available tafsir
      const tafsir = dataService.getAvailableTafsir(currentLanguage);
      console.log("Available tafsir:", tafsir);
      setAvailableTafsir(tafsir);

      // Set default tafsir if none selected
      if (tafsir.length > 0 && selectedTafsir.length === 0) {
        setSelectedTafsir([tafsir[0]]);
        console.log("Set default tafsir:", tafsir[0]);
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
      await playAyah(suraId, verseNumber, sura.nameSimple);
    } catch (error) {
      console.error("Error playing verse:", error);
      Alert.alert("Error", "Failed to play verse audio.");
    }
  };

  const handlePlaySura = async () => {
    try {
      await playSura(suraId, sura.nameSimple);
    } catch (error) {
      console.error("Error playing sura:", error);
      Alert.alert("Error", "Failed to play sura audio.");
    }
  };

  const handleShowTafsir = (verse) => {
    setSelectedVerseForTafsir(verse);
    setShowTafsirModal(true);
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
    // Get translations for selected translation sources
    const verseTranslations = selectedTranslations
      .map((translation) => ({
        ...translation,
        text: dataService.getTranslation(
          verse.verseKey,
          currentLanguage,
          translation.id
        ),
      }))
      .filter((t) => t.text);

    // Check if any tafsir is available for this verse
    const hasTafsir = selectedTafsir.some((tafsir) =>
      dataService.getTafsir(verse.verseKey, currentLanguage, tafsir.id)
    );

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
            {/* Play Button */}
            <TouchableOpacity
              style={{
                padding: 8,
                borderRadius: 20,
                backgroundColor: colors.primaryLight + "20",
              }}
              onPress={() => handlePlayVerse(verse.ayahNumber)}
            >
              <Ionicons name="play" size={20} color={colors.primary} />
            </TouchableOpacity>

            {/* Tafsir Button */}
            {hasTafsir && (
              <TouchableOpacity
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: colors.warning + "20",
                }}
                onPress={() => handleShowTafsir(verse)}
              >
                <Ionicons
                  name="book-outline"
                  size={20}
                  color={colors.warning}
                />
              </TouchableOpacity>
            )}

            {/* More Options Button */}
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
          style={[
            getArabicTextStyle("normal"),
            {
              marginBottom: 16,
              color: colors.text,
            },
          ]}
        >
          {verse.text}
        </Text>

        {/* Multiple Translations */}
        {(readingMode === "translation" || readingMode === "both") &&
          verseTranslations.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              {verseTranslations.map((translation, index) => (
                <View
                  key={translation.id}
                  style={{
                    backgroundColor: colors.primaryLight + "10",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: index < verseTranslations.length - 1 ? 8 : 0,
                    borderLeftWidth: 3,
                    borderLeftColor: colors.primary,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.primary,
                      fontWeight: "600",
                      marginBottom: 4,
                    }}
                  >
                    {translation.name}
                  </Text>
                  <Text
                    style={[
                      currentLanguage === "bn"
                        ? getBengaliTextStyle()
                        : getTextStyle("body"),
                      {
                        lineHeight: 24,
                        color: colors.text,
                      },
                    ]}
                  >
                    {translation.text}
                  </Text>
                </View>
              ))}
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
          onPress={() => setShowTranslationSelector(true)}
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
          onPress={() => setShowTafsirSelector(true)}
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
          onPress={() => setShowFontModal(true)}
        >
          <Ionicons name="text" size={24} color={colors.textSecondary} />
          <Text
            style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}
          >
            Font
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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

        {/* Controls Bar */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            marginBottom: 8,
          }}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            {/* Play Sura Button */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.primary,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
              }}
              onPress={handlePlaySura}
            >
              <Ionicons name="play" size={16} color="white" />
              <Text
                style={{
                  color: "white",
                  marginLeft: 6,
                  ...getTextStyle("caption", "medium"),
                }}
              >
                {t("playSura")}
              </Text>
            </TouchableOpacity>

            {/* Translations Button */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.primaryLight + "20",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
              }}
              onPress={() => setShowTranslationSelector(true)}
            >
              <Ionicons name="language" size={16} color={colors.primary} />
              <Text
                style={{
                  color: colors.primary,
                  marginLeft: 4,
                  ...getTextStyle("caption", "medium"),
                }}
              >
                {selectedTranslations.length}
              </Text>
            </TouchableOpacity>

            {/* Tafsir Button */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.warning + "20",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
              }}
              onPress={() => setShowTafsirSelector(true)}
            >
              <Ionicons name="book-outline" size={16} color={colors.warning} />
              <Text
                style={{
                  color: colors.warning,
                  marginLeft: 4,
                  ...getTextStyle("caption", "medium"),
                }}
              >
                {selectedTafsir.length}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Font Settings Button */}
          <TouchableOpacity
            style={{
              padding: 8,
              borderRadius: 16,
              backgroundColor: colors.primaryLight + "20",
            }}
            onPress={() => setShowFontModal(true)}
          >
            <Ionicons name="text" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {verses.map((verse) => renderVerse(verse))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Multiple Translation Selector */}
      <MultipleTranslationSelector
        visible={showTranslationSelector}
        onClose={() => setShowTranslationSelector(false)}
        selectedTranslations={selectedTranslations}
        onSelectionChange={setSelectedTranslations}
        availableTranslations={availableTranslations}
      />

      {/* Multiple Tafsir Selector */}
      <MultipleTafsirSelector
        visible={showTafsirSelector}
        onClose={() => setShowTafsirSelector(false)}
        selectedTafsir={selectedTafsir}
        onSelectionChange={setSelectedTafsir}
        availableTafsir={availableTafsir}
      />

      {/* Tafsir Modal */}
      <TafsirModal
        visible={showTafsirModal}
        onClose={() => setShowTafsirModal(false)}
        suraId={suraId}
        ayahNumber={selectedVerseForTafsir?.ayahNumber}
        selectedTafsir={selectedTafsir}
        suraName={sura?.nameSimple}
      />

      {/* Font Selection Modal */}
      <FontSelectionModal
        visible={showFontModal}
        onClose={() => setShowFontModal(false)}
      />

      {renderVerseActionsModal()}
    </View>
  );
}
