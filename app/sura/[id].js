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
import Clipboard from "@react-native-clipboard/clipboard";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
import EnhancedTafsirModal from "../../components/EnhancedTafsirModal";
import FontSelectionModal from "../../components/FontSelectionModal";
import EnhancedAudioPlayer from "../../components/EnhancedAudioPlayer";

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
        currentReciter,
        changeReciter,
        getAvailableReciters,
    } = useAudio();

    // State
    const [loading, setLoading] = useState(true);
    const [sura, setSura] = useState(null);
    console.log("🚀 ~ SuraDetailsScreen ~ sura:", sura);
    const [verses, setVerses] = useState([]);
    const [availableTranslations, setAvailableTranslations] = useState([]);
    const [availableTafsir, setAvailableTafsir] = useState([]);
    const [selectedTranslations, setSelectedTranslations] = useState([]);
    const [selectedTafsir, setSelectedTafsir] = useState([]);
    const [showTranslationSelector, setShowTranslationSelector] =
        useState(false);
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
    const [showTranslationInline, setShowTranslationInline] = useState(true);
    const [showTafsirInline, setShowTafsirInline] = useState(false);
    const [showReciterSelector, setShowReciterSelector] = useState(false);
    const [availableReciters, setAvailableReciters] = useState([]);

    const suraId = parseInt(id);

    useEffect(() => {
        loadSuraData();
        loadAvailableReciters();
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, [suraId, currentLanguage]);

    const loadAvailableReciters = () => {
        try {
            const reciters = getAvailableReciters();
            setAvailableReciters(reciters);
        } catch (error) {
            console.error("Error loading reciters:", error);
        }
    };

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
            // Get all selected translations for this verse
            const translationTexts = selectedTranslations
                .map((translation) => {
                    const text = dataService.getTranslation(
                        verse.verseKey,
                        currentLanguage,
                        translation.id
                    );
                    return text ? `${translation.name}: ${text}` : null;
                })
                .filter(Boolean);

            const message = `${sura.nameSimple} (${suraId}:${verse.ayahNumber})

Arabic: ${verse.text}

${translationTexts.join("\n\n")}

Shared from Al-Quran App`;

            await Share.share({
                message: message,
            });
        } catch (error) {
            console.error("Error sharing verse:", error);
        }
    };

    const handleCopyVerse = async (verse) => {
        try {
            // Get all selected translations for this verse
            const translationTexts = selectedTranslations
                .map((translation) => {
                    const text = dataService.getTranslation(
                        verse.verseKey,
                        currentLanguage,
                        translation.id
                    );
                    return text ? `${translation.name}: ${text}` : null;
                })
                .filter(Boolean);

            const message = `${sura.nameSimple} (${suraId}:${verse.ayahNumber})

Arabic: ${verse.text}

${translationTexts.join("\n\n")}`;

            await Clipboard.setString(message);
            Alert.alert("Copied", "Verse copied to clipboard");
        } catch (error) {
            console.error("Error copying verse:", error);
            Alert.alert("Error", "Failed to copy verse");
        }
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

        // Get tafsir for this verse if inline display is enabled
        const verseTafsir = showTafsirInline
            ? selectedTafsir
                  .map((tafsir) => ({
                      ...tafsir,
                      text: dataService.getTafsir(
                          verse.verseKey,
                          currentLanguage,
                          tafsir.id
                      ),
                  }))
                  .filter((t) => t.text)
            : [];

        // Check if any tafsir is available for this verse
        const hasTafsir = selectedTafsir.some((tafsir) =>
            dataService.getTafsir(verse.verseKey, currentLanguage, tafsir.id)
        );

        const isCurrentlyPlaying =
            currentTrack &&
            currentTrack.type === "ayah" &&
            currentTrack.suraId === suraId &&
            currentTrack.ayahNumber === verse.ayahNumber &&
            audioIsPlaying;

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
                        {/* Play Button with visual feedback */}
                        <TouchableOpacity
                            style={{
                                padding: 8,
                                borderRadius: 20,
                                backgroundColor: isCurrentlyPlaying
                                    ? colors.success + "40"
                                    : colors.primaryLight + "20",
                            }}
                            onPress={() => handlePlayVerse(verse.ayahNumber)}
                        >
                            <Ionicons
                                name={isCurrentlyPlaying ? "pause" : "play"}
                                size={20}
                                color={
                                    isCurrentlyPlaying
                                        ? colors.success
                                        : colors.primary
                                }
                            />
                        </TouchableOpacity>

                        {/* Copy Button */}
                        <TouchableOpacity
                            style={{
                                padding: 8,
                                borderRadius: 20,
                                backgroundColor: colors.primaryLight + "20",
                            }}
                            onPress={() => handleCopyVerse(verse)}
                        >
                            <Ionicons
                                name="copy-outline"
                                size={20}
                                color={colors.primary}
                            />
                        </TouchableOpacity>

                        {/* Share Button */}
                        <TouchableOpacity
                            style={{
                                padding: 8,
                                borderRadius: 20,
                                backgroundColor: colors.primaryLight + "20",
                            }}
                            onPress={() => handleShareVerse(verse)}
                        >
                            <Ionicons
                                name="share-outline"
                                size={20}
                                color={colors.primary}
                            />
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
                {showTranslationInline &&
                    (readingMode === "translation" || readingMode === "both") &&
                    verseTranslations.length > 0 && (
                        <View style={{ marginBottom: 12 }}>
                            {verseTranslations.map((translation, index) => (
                                <View
                                    key={translation.id}
                                    style={{
                                        backgroundColor:
                                            colors.primaryLight + "10",
                                        padding: 12,
                                        borderRadius: 8,
                                        marginBottom:
                                            index < verseTranslations.length - 1
                                                ? 8
                                                : 0,
                                        borderLeftWidth: 3,
                                        borderLeftColor: colors.primary,
                                    }}
                                >
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: 4,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 12,
                                                color: colors.primary,
                                                fontWeight: "600",
                                            }}
                                        >
                                            {translation.name}
                                        </Text>
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                gap: 4,
                                            }}
                                        >
                                            <TouchableOpacity
                                                onPress={() =>
                                                    handleCopyVerse(verse)
                                                }
                                                style={{
                                                    padding: 4,
                                                    borderRadius: 8,
                                                    backgroundColor:
                                                        colors.primaryLight +
                                                        "20",
                                                }}
                                            >
                                                <Ionicons
                                                    name="copy-outline"
                                                    size={14}
                                                    color={colors.primary}
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    handleShareVerse(verse)
                                                }
                                                style={{
                                                    padding: 4,
                                                    borderRadius: 8,
                                                    backgroundColor:
                                                        colors.primaryLight +
                                                        "20",
                                                }}
                                            >
                                                <Ionicons
                                                    name="share-outline"
                                                    size={14}
                                                    color={colors.primary}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
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

                {/* Inline Tafsir */}
                {showTafsirInline && verseTafsir.length > 0 && (
                    <View style={{ marginBottom: 12 }}>
                        {verseTafsir.map((tafsir, index) => (
                            <View
                                key={tafsir.id}
                                style={{
                                    backgroundColor: colors.warning + "10",
                                    padding: 12,
                                    borderRadius: 8,
                                    marginBottom:
                                        index < verseTafsir.length - 1 ? 8 : 0,
                                    borderLeftWidth: 3,
                                    borderLeftColor: colors.warning,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: 4,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            color: colors.warning,
                                            fontWeight: "600",
                                        }}
                                    >
                                        {tafsir.name}
                                    </Text>
                                    <View
                                        style={{ flexDirection: "row", gap: 4 }}
                                    >
                                        <TouchableOpacity
                                            onPress={() => {
                                                const message = `${sura.nameSimple} (${suraId}:${verse.ayahNumber})
                        
TAFSIR: ${tafsir.name}
${tafsir.text}`;
                                                Clipboard.setString(message);
                                                Alert.alert(
                                                    "Copied",
                                                    "Tafsir copied to clipboard"
                                                );
                                            }}
                                            style={{
                                                padding: 4,
                                                borderRadius: 8,
                                                backgroundColor:
                                                    colors.warning + "20",
                                            }}
                                        >
                                            <Ionicons
                                                name="copy-outline"
                                                size={14}
                                                color={colors.warning}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                const message = `${sura.nameSimple} (${suraId}:${verse.ayahNumber})
                        
TAFSIR: ${tafsir.name}
${tafsir.text}

Shared from Al-Quran App`;
                                                Share.share({ message });
                                            }}
                                            style={{
                                                padding: 4,
                                                borderRadius: 8,
                                                backgroundColor:
                                                    colors.warning + "20",
                                            }}
                                        >
                                            <Ionicons
                                                name="share-outline"
                                                size={14}
                                                color={colors.warning}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <Text
                                    style={[
                                        currentLanguage === "bn"
                                            ? getBengaliTextStyle()
                                            : getTextStyle("body"),
                                        {
                                            lineHeight: 22,
                                            color: colors.text,
                                            fontSize: 14,
                                        },
                                    ]}
                                >
                                    {tafsir.text}
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
                    {currentLanguage === "bn"
                        ? sura.nameBengali
                        : sura.nameSimple}
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
                            style={{
                                color: colors.primary,
                                fontSize: 12,
                                fontWeight: "500",
                            }}
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
                            style={{
                                color: colors.primary,
                                fontSize: 12,
                                fontWeight: "500",
                            }}
                        >
                            {sura.revelationPlace === "makkah"
                                ? "Meccan"
                                : "Medinan"}
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
                        name={
                            isBookmarked(suraId)
                                ? "bookmark"
                                : "bookmark-outline"
                        }
                        size={24}
                        color={
                            isBookmarked(suraId)
                                ? colors.primary
                                : colors.textSecondary
                        }
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
                    <Ionicons
                        name="language"
                        size={24}
                        color={colors.textSecondary}
                    />
                    <Text
                        style={{
                            color: colors.textSecondary,
                            fontSize: 12,
                            marginTop: 4,
                        }}
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
                    <MaterialIcons
                        name="school"
                        size={24}
                        color={colors.textSecondary}
                    />
                    <Text
                        style={{
                            color: colors.textSecondary,
                            fontSize: 12,
                            marginTop: 4,
                        }}
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
                    <Ionicons
                        name="text"
                        size={24}
                        color={colors.textSecondary}
                    />
                    <Text
                        style={{
                            color: colors.textSecondary,
                            fontSize: 12,
                            marginTop: 4,
                        }}
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
                        <TouchableOpacity
                            onPress={() => setShowVerseActions(false)}
                        >
                            <Ionicons
                                name="close"
                                size={24}
                                color={colors.textSecondary}
                            />
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
                        <Ionicons
                            name="share-outline"
                            size={24}
                            color={colors.primary}
                        />
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
                        <Ionicons
                            name="copy-outline"
                            size={24}
                            color={colors.primary}
                        />
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
        <>
            <Stack.Screen options={{ title: sura.nameBengali }} />
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
                                <Ionicons
                                    name="language"
                                    size={16}
                                    color={colors.primary}
                                />
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
                                <Ionicons
                                    name="book-outline"
                                    size={16}
                                    color={colors.warning}
                                />
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

                            {/* Reciter Button */}
                            <TouchableOpacity
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    backgroundColor: colors.success + "20",
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    borderRadius: 16,
                                }}
                                onPress={() => setShowReciterSelector(true)}
                            >
                                <Ionicons
                                    name="person"
                                    size={16}
                                    color={colors.success}
                                />
                                <Text
                                    style={{
                                        color: colors.success,
                                        marginLeft: 4,
                                        ...getTextStyle("caption", "medium"),
                                    }}
                                >
                                    Reciter
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
                            <Ionicons
                                name="text"
                                size={20}
                                color={colors.primary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Inline Display Toggles */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-around",
                            alignItems: "center",
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            backgroundColor: colors.surface,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                            marginBottom: 8,
                        }}
                    >
                        <TouchableOpacity
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 16,
                                backgroundColor: showTranslationInline
                                    ? colors.primary + "20"
                                    : colors.border + "20",
                            }}
                            onPress={() =>
                                setShowTranslationInline(!showTranslationInline)
                            }
                        >
                            <Ionicons
                                name={
                                    showTranslationInline
                                        ? "checkmark-circle"
                                        : "radio-button-off"
                                }
                                size={16}
                                color={
                                    showTranslationInline
                                        ? colors.primary
                                        : colors.textSecondary
                                }
                            />
                            <Text
                                style={{
                                    marginLeft: 6,
                                    color: showTranslationInline
                                        ? colors.primary
                                        : colors.textSecondary,
                                    ...getTextStyle("caption", "medium"),
                                }}
                            >
                                Show Translations
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 16,
                                backgroundColor: showTafsirInline
                                    ? colors.warning + "20"
                                    : colors.border + "20",
                            }}
                            onPress={() =>
                                setShowTafsirInline(!showTafsirInline)
                            }
                        >
                            <Ionicons
                                name={
                                    showTafsirInline
                                        ? "checkmark-circle"
                                        : "radio-button-off"
                                }
                                size={16}
                                color={
                                    showTafsirInline
                                        ? colors.warning
                                        : colors.textSecondary
                                }
                            />
                            <Text
                                style={{
                                    marginLeft: 6,
                                    color: showTafsirInline
                                        ? colors.warning
                                        : colors.textSecondary,
                                    ...getTextStyle("caption", "medium"),
                                }}
                            >
                                Show Tafsir
                            </Text>
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

                {/* Enhanced Tafsir Modal */}
                <EnhancedTafsirModal
                    visible={showTafsirModal}
                    onClose={() => setShowTafsirModal(false)}
                    suraId={suraId}
                    ayahNumber={selectedVerseForTafsir?.ayahNumber}
                    selectedTafsir={selectedTafsir}
                    selectedTranslations={selectedTranslations}
                    suraName={sura?.nameSimple}
                />

                {/* Font Selection Modal */}
                <FontSelectionModal
                    visible={showFontModal}
                    onClose={() => setShowFontModal(false)}
                />

                {renderVerseActionsModal()}

                {/* Reciter Selector Modal */}
                <Modal
                    visible={showReciterSelector}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowReciterSelector(false)}
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
                                maxHeight: "70%",
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: 20,
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
                                    Select Reciter
                                </Text>
                                <TouchableOpacity
                                    onPress={() =>
                                        setShowReciterSelector(false)
                                    }
                                >
                                    <Ionicons
                                        name="close"
                                        size={24}
                                        color={colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={availableReciters}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            paddingHorizontal: 20,
                                            paddingVertical: 16,
                                            borderBottomWidth: 1,
                                            borderBottomColor:
                                                colors.border + "30",
                                        }}
                                        onPress={() => {
                                            changeReciter(item.id);
                                            setShowReciterSelector(false);
                                            Alert.alert(
                                                "Reciter Changed",
                                                `Now using ${item.name}`
                                            );
                                        }}
                                    >
                                        <View>
                                            <Text
                                                style={{
                                                    ...getTextStyle(
                                                        "body",
                                                        "medium"
                                                    ),
                                                    color: colors.text,
                                                }}
                                            >
                                                {item.name}
                                            </Text>
                                            <Text
                                                style={{
                                                    ...getTextStyle("caption"),
                                                    color: colors.textSecondary,
                                                    marginTop: 2,
                                                }}
                                            >
                                                {item.style}
                                            </Text>
                                        </View>
                                        {currentReciter === item.id && (
                                            <Ionicons
                                                name="checkmark"
                                                size={20}
                                                color={colors.success}
                                            />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </Modal>

                {/* Enhanced Audio Player */}
                <EnhancedAudioPlayer />
            </View>
        </>
    );
}
