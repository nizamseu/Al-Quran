import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useFont } from "../contexts/FontContext";

export default function Home() {
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();
    const { getTextStyle } = useFont();
    const quickActions = [
        {
            title: t("home.quickActions.startReading"),
            subtitle: t("home.quickActions.continueJourney"),
            icon: "book",
            iconType: "Ionicons",
            color: colors.info,
            action: () => router.push("/sura-list"),
        },
        {
            title: t("home.quickActions.bookmarks"),
            subtitle: t("home.quickActions.savedVerses"),
            icon: "bookmark",
            iconType: "Ionicons",
            color: colors.secondary,
            action: () => {},
        },
        {
            title: t("home.quickActions.prayerTimes"),
            subtitle: t("home.quickActions.todaySchedule"),
            icon: "time",
            iconType: "Ionicons",
            color: colors.warning,
            action: () => {},
        },
        {
            title: t("home.quickActions.duas"),
            subtitle: t("home.quickActions.dailySupplications"),
            icon: "emoji-people",
            iconType: "MaterialIcons",
            color: colors.success,
            action: () => {},
        },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Main Content */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Welcome Section */}
                <View
                    style={{
                        backgroundColor: colors.primary,
                        marginHorizontal: 16,
                        marginTop: 24,
                        borderRadius: 16,
                        padding: 24,
                        ...colors.shadows?.large,
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
                            <MaterialIcons
                                name="book"
                                size={24}
                                color="white"
                            />
                        </View>
                        <View style={{ marginLeft: 16, flex: 1 }}>
                            <Text
                                style={{
                                    ...getTextStyle("title", "bold"),
                                    color: "white",
                                }}
                            >
                                {t("home.welcome.title")}
                            </Text>
                            <Text
                                style={{
                                    ...getTextStyle("body"),
                                    color: "#bbf7d0",
                                }}
                            >
                                {t("home.welcome.subtitle")}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push("/sura-list")}
                        style={{
                            backgroundColor: "rgba(255,255,255,0.2)",
                            borderRadius: 12,
                            padding: 16,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <View>
                            <Text
                                style={{
                                    ...getTextStyle("subtitle", "semiBold"),
                                    color: "white",
                                }}
                            >
                                {t("home.welcome.continueReading")}
                            </Text>
                            <Text
                                style={{
                                    ...getTextStyle("body"),
                                    color: "#bbf7d0",
                                }}
                            >
                                {t("home.welcome.pickUp")}
                            </Text>
                        </View>
                        <Ionicons
                            name="arrow-forward"
                            size={20}
                            color="white"
                        />
                    </TouchableOpacity>
                </View>

                {/* Quick Actions Grid */}
                <View style={{ marginHorizontal: 16, marginTop: 24 }}>
                    <Text
                        style={{
                            ...getTextStyle("display", "bold"),
                            color: colors.text,
                            marginBottom: 16,
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
                                onPress={action.action}
                                style={{
                                    width: "48%",
                                    backgroundColor: action.color,
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 16,
                                    ...colors.shadows?.medium,
                                }}
                            >
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        backgroundColor:
                                            "rgba(255,255,255,0.2)",
                                        borderRadius: 12,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: 12,
                                    }}
                                >
                                    {action.iconType === "Ionicons" ? (
                                        <Ionicons
                                            name={action.icon}
                                            size={20}
                                            color="white"
                                        />
                                    ) : (
                                        <MaterialIcons
                                            name={action.icon}
                                            size={20}
                                            color="white"
                                        />
                                    )}
                                </View>

                                <Text
                                    style={{
                                        ...getTextStyle("subtitle", "semiBold"),
                                        color: "white",
                                        marginBottom: 4,
                                    }}
                                >
                                    {action.title}
                                </Text>
                                <Text
                                    style={{
                                        ...getTextStyle("caption"),
                                        color: "rgba(255,255,255,0.8)",
                                    }}
                                >
                                    {action.subtitle}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={{ marginHorizontal: 16, marginTop: 24 }}>
                    <Text
                        style={{
                            ...getTextStyle("display", "bold"),
                            color: colors.text,
                            marginBottom: 16,
                        }}
                    >
                        {t("home.recentActivity.title")}
                    </Text>

                    <View
                        style={{
                            backgroundColor: colors.surface,
                            borderRadius: 16,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: colors.border,
                            ...colors.shadows?.small,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 12,
                            }}
                        >
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    backgroundColor: colors.primaryLight + "20",
                                    borderRadius: 20,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <MaterialIcons
                                    name="history"
                                    size={20}
                                    color={colors.primary}
                                />
                            </View>
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text
                                    style={{
                                        ...getTextStyle("subtitle", "semiBold"),
                                        color: colors.text,
                                    }}
                                >
                                    {t("home.recentActivity.lastRead")}
                                </Text>
                                <Text
                                    style={{
                                        ...getTextStyle("caption"),
                                        color: colors.textSecondary,
                                    }}
                                >
                                    {t("home.recentActivity.lastReadDetails")}
                                </Text>
                            </View>
                            <TouchableOpacity>
                                <Ionicons
                                    name="chevron-forward"
                                    size={16}
                                    color={colors.textTertiary}
                                />
                            </TouchableOpacity>
                        </View>

                        <View
                            style={{
                                height: 1,
                                backgroundColor: colors.border,
                                marginVertical: 12,
                            }}
                        />

                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    backgroundColor: colors.info + "20",
                                    borderRadius: 20,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Ionicons
                                    name="bookmark"
                                    size={20}
                                    color={colors.info}
                                />
                            </View>
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text
                                    style={{
                                        ...getTextStyle("subtitle", "semiBold"),
                                        color: colors.text,
                                    }}
                                >
                                    {t("home.recentActivity.bookmarked")}
                                </Text>
                                <Text
                                    style={{
                                        ...getTextStyle("caption"),
                                        color: colors.textSecondary,
                                    }}
                                >
                                    {t("home.recentActivity.bookmarkedDetails")}
                                </Text>
                            </View>
                            <TouchableOpacity>
                                <Ionicons
                                    name="chevron-forward"
                                    size={16}
                                    color={colors.textTertiary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Daily Verse */}
                <View style={{ marginHorizontal: 16, marginTop: 24 }}>
                    <Text
                        style={{
                            ...getTextStyle("display", "bold"),
                            color: colors.text,
                            marginBottom: 16,
                        }}
                    >
                        {t("home.dailyVerse.title")}
                    </Text>

                    <View
                        style={{
                            backgroundColor: colors.secondary,
                            borderRadius: 16,
                            padding: 24,
                            ...colors.shadows?.large,
                        }}
                    >
                        <View
                            style={{ alignItems: "center", marginBottom: 16 }}
                        >
                            <Text
                                style={{
                                    ...getTextStyle("subtitle", "medium"),
                                    color: "white",
                                    textAlign: "center",
                                    lineHeight: 24,
                                }}
                            >
                                {t("home.dailyVerse.verse")}
                            </Text>
                            <Text
                                style={{
                                    ...getTextStyle("caption"),
                                    color: "rgba(255,255,255,0.8)",
                                    marginTop: 12,
                                }}
                            >
                                {t("home.dailyVerse.reference")}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={{
                                backgroundColor: "rgba(255,255,255,0.2)",
                                borderRadius: 12,
                                padding: 12,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Ionicons
                                name="share-outline"
                                size={18}
                                color="white"
                            />
                            <Text
                                style={{
                                    ...getTextStyle("subtitle", "semiBold"),
                                    color: "white",
                                    marginLeft: 8,
                                }}
                            >
                                {t("home.dailyVerse.share")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
