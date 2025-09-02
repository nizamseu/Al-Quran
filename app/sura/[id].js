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
  TextInput,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

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
  const { getTextStyle, fontSize, fontFamily } = useFont();
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
  console.log("sura", sura);
  console.log("verses", verses);
  console.log("translations", translations);
  console.log("tafsir", tafsir);
  console.log("playingVerse", playingVerse);

  const suraId = parseInt(id);

  useEffect(() => {
    loadSuraData();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [suraId]);

  useEffect(() => {
    // Update last read when component mounts
    if (sura) {
      updateLastRead(suraId, sura.name);
    }
  }, [sura]);

  const loadSuraData = async () => {
    try {
      setLoading(true);

      // Get sura info
      const suraInfo = dataService.getSuraById(suraId);
      setSura(suraInfo);

      // Get verses
      const suraVerses = dataService.getVersesForSura(suraId);
      setVerses(suraVerses);

      // Get available translations
      const availableTranslations =
        dataService.getAvailableTranslations(currentLanguage);
      setTranslations(availableTranslations);

      // Set default translation
      if (availableTranslations.length > 0 && !currentTranslation) {
        setCurrentTranslation(availableTranslations[0]);
      }

      // Get available tafsir
      const availableTafsir = dataService.getAvailableTafsir(currentLanguage);
      setTafsir(availableTafsir);

      // Set default tafsir
      if (availableTafsir.length > 0 && !currentTafsir) {
        setCurrentTafsir(availableTafsir[0]);
      }
    } catch (error) {
      console.error("Error loading sura data:", error);
      Alert.alert(t("common.error"), t("suraDetail.loadError"));
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
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      if (playingVerse === verseNumber && isPlaying) {
        setIsPlaying(false);
        setPlayingVerse(null);
        return;
      }

      const audioData = dataService.getVerseRecitation(
        suraId,
        verseNumber,
        settings.reciter
      );
      if (audioData) {
        const { sound } = await Audio.Sound.createAsync({ uri: audioData.url });
        soundRef.current = sound;

        await sound.playAsync();
        setPlayingVerse(verseNumber);
        setIsPlaying(true);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPlayingVerse(null);
          }
        });
      }
    } catch (error) {
      console.error("Error playing verse:", error);
      Alert.alert(t("common.error"), t("suraDetail.playError"));
    }
  };

  const handleShareVerse = async (verse) => {
    try {
      const translationText = currentTranslation
        ? dataService.getTranslation(
            suraId,
            verse.ayahNumber,
            currentTranslation.id
          )
        : "";

      const message = `${suraName} (${suraId}:${verse.ayahNumber})
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
    Alert.alert(t("common.copied"), t("suraDetail.verseCopied"));
  };

  const scrollToVerse = (verseNumber) => {
    // Implementation for scrolling to specific verse
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: verseNumber * 200, animated: true });
    }
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
          {t("common.sura")} {sura.id}
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
              {sura.versesCount} {t("common.verses")}
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
              {t(`common.${sura.revelationPlace?.toLowerCase() || "unknown"}`)}
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
          onPress={() => toggleBookmark(suraId, sura.name_simple)}
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
            {t(isBookmarked(suraId) ? "common.bookmarked" : "common.bookmark")}
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
            {t("suraDetail.translation")}
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
            {t("suraDetail.tafsir")}
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
            {t("common.settings")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVerse = (verse) => {
    const isPlaying = playingVerse === verse.ayahNumber;
    const translationText = currentTranslation
      ? dataService.getTranslation(
          suraId,
          verse.ayahNumber,
          currentTranslation.id
        )
      : null;
    const tafsirText = currentTafsir
      ? dataService.getTafsir(suraId, verse.ayahNumber, currentTafsir.id)
      : null;

    return (
      <TouchableOpacity
        key={verse.id}
        style={{
          backgroundColor: colors.surface,
          marginHorizontal: 16,
          marginBottom: 16,
          borderRadius: 12,
          padding: 16,
          borderWidth: selectedVerse?.id === verse.id ? 2 : 1,
          borderColor:
            selectedVerse?.id === verse.id ? colors.primary : colors.border,
        }}
        onPress={() => handleVersePress(verse)}
        activeOpacity={0.7}
      >
        {/* Verse Number */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View
            style={{
              backgroundColor: colors.primary,
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 6,
              minWidth: 40,
              alignItems: "center",
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
              onPress={() => handlePlayVerse(verse.ayahNumber)}
              style={{
                padding: 8,
                backgroundColor: isPlaying ? colors.primary : colors.background,
                borderRadius: 20,
              }}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={16}
                color={isPlaying ? "white" : colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleShareVerse(verse)}
              style={{
                padding: 8,
                backgroundColor: colors.background,
                borderRadius: 20,
              }}
            >
              <Ionicons name="share" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Arabic Text */}
        <Text
          style={{
            fontSize: fontSize.arabic || 24,
            textAlign: "right",
            color: colors.text,
            marginBottom: 16,
            lineHeight: (fontSize.arabic || 24) * 1.5,
            fontFamily: "System",
          }}
        >
          {verse.text}
        </Text>

        {/* Translation */}
        {translationText &&
          (readingMode === "translation" || readingMode === "both") && (
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: fontSize.translation || 16,
                  color: colors.text,
                  lineHeight: (fontSize.translation || 16) * 1.4,
                  ...getTextStyle("body"),
                }}
              >
                {translationText}
              </Text>
              {currentTranslation && (
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 4,
                    fontStyle: "italic",
                  }}
                >
                  - {currentTranslation.name}
                </Text>
              )}
            </View>
          )}

        {/* Tafsir */}
        {tafsirText && (readingMode === "tafsir" || readingMode === "both") && (
          <View
            style={{
              backgroundColor: colors.background,
              padding: 12,
              borderRadius: 8,
              borderLeftWidth: 3,
              borderLeftColor: colors.primary,
            }}
          >
            <Text
              style={{
                fontSize: fontSize.tafsir || 14,
                color: colors.text,
                lineHeight: (fontSize.tafsir || 14) * 1.4,
                ...getTextStyle("body"),
              }}
            >
              {tafsirText}
            </Text>
            {currentTafsir && (
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginTop: 8,
                  fontStyle: "italic",
                }}
              >
                - {currentTafsir.name}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTranslationModal = () => (
    <Modal
      visible={showTranslations}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowTranslations(false)}
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
            maxHeight: "70%",
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
              {t("suraDetail.selectTranslation")}
            </Text>
            <TouchableOpacity onPress={() => setShowTranslations(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
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
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor:
                    currentTranslation?.id === item.id
                      ? colors.primaryLight
                      : "transparent",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
                onPress={() => {
                  setCurrentTranslation(item);
                  setShowTranslations(false);
                }}
              >
                <Ionicons
                  name={
                    currentTranslation?.id === item.id
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={
                    currentTranslation?.id === item.id
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text
                    style={{
                      color:
                        currentTranslation?.id === item.id
                          ? colors.primary
                          : colors.text,
                      fontWeight:
                        currentTranslation?.id === item.id ? "bold" : "normal",
                      ...getTextStyle("body"),
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {item.author}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );

  const renderTafsirModal = () => (
    <Modal
      visible={showTafsir}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowTafsir(false)}
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
            maxHeight: "70%",
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
              {t("suraDetail.selectTafsir")}
            </Text>
            <TouchableOpacity onPress={() => setShowTafsir(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
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
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor:
                    currentTafsir?.id === item.id
                      ? colors.primaryLight
                      : "transparent",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
                onPress={() => {
                  setCurrentTafsir(item);
                  setShowTafsir(false);
                }}
              >
                <Ionicons
                  name={
                    currentTafsir?.id === item.id
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={
                    currentTafsir?.id === item.id
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text
                    style={{
                      color:
                        currentTafsir?.id === item.id
                          ? colors.primary
                          : colors.text,
                      fontWeight:
                        currentTafsir?.id === item.id ? "bold" : "normal",
                      ...getTextStyle("body"),
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {item.author}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
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
            maxHeight: "70%",
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
              {t("suraDetail.readingSettings")}
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
              {t("suraDetail.readingMode")}
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
                    readingMode === mode ? colors.primaryLight : "transparent",
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
                  }}
                >
                  {t(`suraDetail.modes.${mode}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
          {t("common.loading")}...
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
          {t("suraDetail.notFound")}
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
    </View>
  );
}
