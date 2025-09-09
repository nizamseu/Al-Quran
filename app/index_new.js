import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import { useLanguage } from "../contexts/LanguageContext";
import { useFont } from "../contexts/FontContext";
import { useSettings } from "../contexts/SettingsContext";
import dataService from "../services/dataService";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const { width: screenWidth } = Dimensions.get("window");

export default function Home() {
    const { colors, isDark } = useTheme();
    const { t, currentLanguage } = useLanguage();
    const { getTextStyle } = useFont();
    const { settings, getReadingProgress } = useSettings();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [recentSuras, setRecentSuras] = useState([]);
    const [todayProgress, setTodayProgress] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Get reading statistics
            const statistics = dataService.getStatistics();
            setStats(statistics);

            // Get recent suras
            const recent = settings.lastReadSuras?.slice(0, 3) || [];
            const recentWithDetails = recent.map((item) => ({
                ...item,
                ...dataService.getSuraById(item.suraId),
            }));
            setRecentSuras(recentWithDetails);

            // Get today's progress
            if (getReadingProgress) {
                const progress = getReadingProgress();
                setTodayProgress(progress);
            }
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: t("home.quickActions.continueReading"),
            subtitle:
                settings.lastReadSuras?.length > 0
                    ? `${t("common.sura")} ${settings.lastReadSuras[0]?.suraName}`
                    : t("home.quickActions.startJourney"),
            icon: "book-outline",
            iconType: "Ionicons",
            color: "#3b82f6",
            action: () => {
                if (settings.lastReadSuras?.length > 0) {
                    router.push(`/sura/${settings.lastReadSuras[0].suraId}`);
                } else {
                    router.push("/sura-list");
                }
            },
        },
        {
            title: t("home.quickActions.bookmarks"),
            subtitle: `${settings.bookmarkedSuras?.length || 0} ${t("home.quickActions.savedSuras")}`,
            icon: "bookmark",
            iconType: "Ionicons",
            color: "#8b5cf6",
            action: () => router.push("/bookmarks"),
        },
        {
            title: t("home.quickActions.search"),
            subtitle: t("home.quickActions.findVerses"),
            icon: "search",
            iconType: "Ionicons",
            color: "#f97316",
            action: () => router.push("/search"),
        },
        {
            title: t("home.quickActions.randomVerse"),
            subtitle: t("home.quickActions.dailyInspiration"),
            icon: "refresh",
            iconType: "MaterialIcons",
            color: "#14b8a6",
            action: () => {
                const randomSura = Math.floor(Math.random() * 114) + 1;
                router.push(`/sura/${randomSura}`);
            },
        },
    ];

    const renderWelcomeSection = () => (
        <View
            style={{
                backgroundColor: colors.primary,
                marginHorizontal: 16,
                marginTop: 24,
                borderRadius: 16,
                padding: 24,
                shadowColor: isDark ? colors.text : "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 8,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                }}
            >
                <View
                    style={{
                        width: 48,
                        height: 48,
                        backgroundColor: "rgba(255,255,255,0.2)",
                        borderRadius: 24,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <MaterialIcons name="book" size={24} color="white" />
                </View>
                <View style={{ marginLeft: 16, flex: 1 }}>
                    <Text
                        style={{
                            color: "white",
                            fontSize: 18,
                            fontWeight: "bold",
                            ...getTextStyle("title", "bold"),
                        }}
                    >
                        {t("home.welcome.title")}
                    </Text>
                    <Text
                        style={{
                            color: "rgba(255,255,255,0.9)",
                            fontSize: 14,
                            marginTop: 4,
                            ...getTextStyle("body"),
                        }}
                    >
                        {new Date().toLocaleDateString(
                            currentLanguage === "bn" ? "bn-BD" : "en-US",
                            {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            }
                        )}
                    </Text>
                </View>
            </View>

            {todayProgress && (
                <View
                    style={{
                        backgroundColor: "rgba(255,255,255,0.15)",
                        borderRadius: 12,
                        padding: 16,
                    }}
                >
                    <Text
                        style={{
                            color: "white",
                            fontSize: 16,
                            fontWeight: "600",
                            marginBottom: 8,
                            ...getTextStyle("subtitle", "bold"),
                        }}
                    >
                        {t("home.todayProgress")}
                    </Text>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}
                    >
                        <View>
                            <Text
                                style={{
                                    color: "rgba(255,255,255,0.9)",
                                    fontSize: 12,
                                }}
                            >
                                {t("home.versesRead")}
                            </Text>
                            <Text
                                style={{
                                    color: "white",
                                    fontSize: 18,
                                    fontWeight: "bold",
                                }}
                            >
                                {todayProgress.versesRead || 0}
                            </Text>
                        </View>
                        <View>
                            <Text
                                style={{
                                    color: "rgba(255,255,255,0.9)",
                                    fontSize: 12,
                                }}
                            >
                                {t("home.timeSpent")}
                            </Text>
                            <Text
                                style={{
                                    color: "white",
                                    fontSize: 18,
                                    fontWeight: "bold",
                                }}
                            >
                                {Math.floor(
                                    (todayProgress.timeSpent || 0) / 60
                                )}
                                m
                            </Text>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );

    const renderQuickStats = () => (
        <View style={{ marginHorizontal: 16, marginTop: 24 }}>
            <Text
                style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: colors.text,
                    marginBottom: 16,
                    ...getTextStyle("title", "bold"),
                }}
            >
                {t("home.quickStats")}
            </Text>

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 16,
                }}
            >
                <View
                    style={{
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        padding: 16,
                        flex: 1,
                        marginRight: 8,
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 8,
                        }}
                    >
                        <MaterialIcons name="book" size={20} color="#3b82f6" />
                        <Text
                            style={{
                                color: colors.text,
                                fontSize: 14,
                                fontWeight: "500",
                                marginLeft: 8,
                                ...getTextStyle("body"),
                            }}
                        >
                            {t("home.totalSuras")}
                        </Text>
                    </View>
                    <Text
                        style={{
                            color: colors.text,
                            fontSize: 24,
                            fontWeight: "bold",
                            ...getTextStyle("title", "bold"),
                        }}
                    >
                        114
                    </Text>
                </View>

                <View
                    style={{
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        padding: 16,
                        flex: 1,
                        marginLeft: 8,
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 8,
                        }}
                    >
                        <MaterialIcons
                            name="format-quote"
                            size={20}
                            color="#8b5cf6"
                        />
                        <Text
                            style={{
                                color: colors.text,
                                fontSize: 14,
                                fontWeight: "500",
                                marginLeft: 8,
                                ...getTextStyle("body"),
                            }}
                        >
                            {t("home.totalVerses")}
                        </Text>
                    </View>
                    <Text
                        style={{
                            color: colors.text,
                            fontSize: 24,
                            fontWeight: "bold",
                            ...getTextStyle("title", "bold"),
                        }}
                    >
                        6,236
                    </Text>
                </View>
            </View>

            {stats && (
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}
                >
                    <View
                        style={{
                            backgroundColor: colors.surface,
                            borderRadius: 12,
                            padding: 16,
                            flex: 1,
                            marginRight: 8,
                            borderWidth: 1,
                            borderColor: colors.border,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 8,
                            }}
                        >
                            <Ionicons
                                name="language"
                                size={20}
                                color="#f97316"
                            />
                            <Text
                                style={{
                                    color: colors.text,
                                    fontSize: 14,
                                    fontWeight: "500",
                                    marginLeft: 8,
                                    ...getTextStyle("body"),
                                }}
                            >
                                {t("home.translations")}
                            </Text>
                        </View>
                        <Text
                            style={{
                                color: colors.text,
                                fontSize: 24,
                                fontWeight: "bold",
                                ...getTextStyle("title", "bold"),
                            }}
                        >
                            {stats.totalTranslations || 0}
                        </Text>
                    </View>

                    <View
                        style={{
                            backgroundColor: colors.surface,
                            borderRadius: 12,
                            padding: 16,
                            flex: 1,
                            marginLeft: 8,
                            borderWidth: 1,
                            borderColor: colors.border,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 8,
                            }}
                        >
                            <MaterialIcons
                                name="school"
                                size={20}
                                color="#14b8a6"
                            />
                            <Text
                                style={{
                                    color: colors.text,
                                    fontSize: 14,
                                    fontWeight: "500",
                                    marginLeft: 8,
                                    ...getTextStyle("body"),
                                }}
                            >
                                {t("home.tafsir")}
                            </Text>
                        </View>
                        <Text
                            style={{
                                color: colors.text,
                                fontSize: 24,
                                fontWeight: "bold",
                                ...getTextStyle("title", "bold"),
                            }}
                        >
                            {stats.totalTafsir || 0}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );

    const renderQuickActions = () => (
        <View style={{ marginHorizontal: 16, marginTop: 24 }}>
            <Text
                style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: colors.text,
                    marginBottom: 16,
                    ...getTextStyle("title", "bold"),
                }}
            >
                {t("home.quickActions.title")}
            </Text>

            <View
                style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                }}
            >
                {quickActions.map((action, index) => (
                    <TouchableOpacity
                        key={index}
                        style={{
                            backgroundColor: colors.surface,
                            borderRadius: 12,
                            padding: 20,
                            width: "48%",
                            marginBottom: 16,
                            shadowColor: isDark ? colors.text : "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 2,
                            borderWidth: 1,
                            borderColor: colors.border,
                        }}
                        onPress={action.action}
                        activeOpacity={0.7}
                    >
                        <View
                            style={{
                                width: 48,
                                height: 48,
                                backgroundColor: `${action.color}20`,
                                borderRadius: 12,
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 12,
                            }}
                        >
                            {action.iconType === "Ionicons" ? (
                                <Ionicons
                                    name={action.icon}
                                    size={24}
                                    color={action.color}
                                />
                            ) : (
                                <MaterialIcons
                                    name={action.icon}
                                    size={24}
                                    color={action.color}
                                />
                            )}
                        </View>
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: "bold",
                                color: colors.text,
                                marginBottom: 4,
                                ...getTextStyle("subtitle", "bold"),
                            }}
                        >
                            {action.title}
                        </Text>
                        <Text
                            style={{
                                fontSize: 12,
                                color: colors.textSecondary,
                                lineHeight: 16,
                                ...getTextStyle("body"),
                            }}
                        >
                            {action.subtitle}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderRecentSuras = () => {
        if (recentSuras.length === 0) return null;

        return (
            <View style={{ marginHorizontal: 16, marginTop: 24 }}>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 20,
                            fontWeight: "bold",
                            color: colors.text,
                            ...getTextStyle("title", "bold"),
                        }}
                    >
                        {t("home.recentlyRead")}
                    </Text>
                    <TouchableOpacity onPress={() => router.push("/sura-list")}>
                        <Text
                            style={{
                                color: colors.primary,
                                fontSize: 14,
                                fontWeight: "500",
                                ...getTextStyle("body"),
                            }}
                        >
                            {t("common.seeAll")}
                        </Text>
                    </TouchableOpacity>
                </View>

                {recentSuras.map((sura, index) => (
                    <TouchableOpacity
                        key={sura.suraId}
                        style={{
                            backgroundColor: colors.surface,
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 12,
                            flexDirection: "row",
                            alignItems: "center",
                            shadowColor: isDark ? colors.text : "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 1,
                            borderWidth: 1,
                            borderColor: colors.border,
                        }}
                        onPress={() => router.push(`/sura/${sura.suraId}`)}
                        activeOpacity={0.7}
                    >
                        <View
                            style={{
                                backgroundColor: colors.primary,
                                borderRadius: 8,
                                padding: 8,
                                marginRight: 16,
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
                                {sura.id || sura.suraId}
                            </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: "bold",
                                    color: colors.text,
                                    marginBottom: 4,
                                    ...getTextStyle("subtitle", "bold"),
                                }}
                            >
                                {currentLanguage === "bn"
                                    ? sura.name_complex
                                    : sura.name_simple}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 12,
                                    color: colors.textSecondary,
                                    ...getTextStyle("body"),
                                }}
                            >
                                {sura.verses_count} {t("common.verses")} •{" "}
                                {t(
                                    `common.${sura.revelation_place?.toLowerCase()}`
                                )}
                            </Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

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

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar
                backgroundColor={colors.background}
                barStyle={isDark ? "light-content" : "dark-content"}
            />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
            >
                {renderWelcomeSection()}
                {renderQuickStats()}
                {renderQuickActions()}
                {renderRecentSuras()}
            </ScrollView>
        </View>
    );
}
