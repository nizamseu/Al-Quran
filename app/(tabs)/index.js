import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useFont } from "../../contexts/FontContext";

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
      color: "#3b82f6",
      action: () => router.push("/sura-list"),
    },
    {
      title: t("home.quickActions.bookmarks"),
      subtitle: t("home.quickActions.savedVerses"),
      icon: "bookmark",
      iconType: "Ionicons",
      color: "#8b5cf6",
      action: () => {},
    },
    {
      title: t("home.quickActions.prayerTimes"),
      subtitle: t("home.quickActions.todaySchedule"),
      icon: "time",
      iconType: "Ionicons",
      color: "#f97316",
      action: () => {},
    },
    {
      title: t("home.quickActions.duas"),
      subtitle: t("home.quickActions.dailySupplications"),
      icon: "emoji-people",
      iconType: "MaterialIcons",
      color: "#14b8a6",
      action: () => {},
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
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
                  color: isDark ? "#d1d5db" : "#bbf7d0",
                  fontSize: 14,
                  ...getTextStyle("body"),
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
                  color: "white",
                  fontWeight: "600",
                  fontSize: 16,
                  ...getTextStyle("subtitle", "semiBold"),
                }}
              >
                {t("home.welcome.continueReading")}
              </Text>
              <Text
                style={{
                  color: isDark ? "#d1d5db" : "#bbf7d0",
                  fontSize: 14,
                  ...getTextStyle("body"),
                }}
              >
                {t("home.welcome.pickUp")}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <View style={{ marginHorizontal: 16, marginTop: 24 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 20,
              fontWeight: "bold",
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
                onPress={action.action}
                style={{
                  width: "48%",
                  backgroundColor: action.color,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  {action.iconType === "Ionicons" ? (
                    <Ionicons name={action.icon} size={20} color="white" />
                  ) : (
                    <MaterialIcons name={action.icon} size={20} color="white" />
                  )}
                </View>

                <Text
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: 16,
                    marginBottom: 4,
                    ...getTextStyle("subtitle", "semiBold"),
                  }}
                >
                  {action.title}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 14,
                    ...getTextStyle("caption"),
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
              color: colors.text,
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 16,
              ...getTextStyle("title", "bold"),
            }}
          >
            {t("home.recentActivity.title")}
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              shadowColor: isDark ? colors.text : "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 2,
              borderWidth: 1,
              borderColor: colors.border,
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
                  backgroundColor: isDark
                    ? "rgba(16, 185, 129, 0.1)"
                    : "#f0fdf4",
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
                    color: colors.text,
                    fontWeight: "600",
                    ...getTextStyle("subtitle", "semiBold"),
                  }}
                >
                  {t("home.recentActivity.lastRead")}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    ...getTextStyle("caption"),
                  }}
                >
                  {t("home.recentActivity.lastReadDetails")}
                </Text>
              </View>
              <TouchableOpacity>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textSecondary}
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

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: isDark
                    ? "rgba(59, 130, 246, 0.1)"
                    : "#eff6ff",
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="bookmark" size={20} color="#3b82f6" />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontWeight: "600",
                    ...getTextStyle("subtitle", "semiBold"),
                  }}
                >
                  {t("home.recentActivity.bookmarked")}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    ...getTextStyle("caption"),
                  }}
                >
                  {t("home.recentActivity.bookmarkedDetails")}
                </Text>
              </View>
              <TouchableOpacity>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Daily Verse */}
        <View style={{ marginHorizontal: 16, marginTop: 24 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 16,
              ...getTextStyle("title", "bold"),
            }}
          >
            {t("home.dailyVerse.title")}
          </Text>

          <View
            style={{
              backgroundColor: "#8b5cf6",
              borderRadius: 16,
              padding: 24,
              shadowColor: isDark ? colors.text : "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 18,
                  lineHeight: 28,
                  fontWeight: "500",
                  ...getTextStyle("body", "medium"),
                }}
              >
                {t("home.dailyVerse.verse")}
              </Text>
              <Text
                style={{
                  color: "#c4b5fd",
                  fontSize: 14,
                  marginTop: 12,
                  ...getTextStyle("caption"),
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
              <Ionicons name="share-outline" size={18} color="white" />
              <Text
                style={{
                  color: "white",
                  fontWeight: "600",
                  marginLeft: 8,
                  ...getTextStyle("body", "semiBold"),
                }}
              >
                {t("home.dailyVerse.shareVerse")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
