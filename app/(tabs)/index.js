import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function Home() {
  const quickActions = [
    {
      title: "Start Reading",
      subtitle: "Continue your journey",
      icon: "book",
      iconType: "Ionicons",
      color: "#3b82f6",
      action: () => router.push("/sura-list"),
    },
    {
      title: "Bookmarks",
      subtitle: "Saved verses",
      icon: "bookmark",
      iconType: "Ionicons",
      color: "#8b5cf6",
      action: () => {},
    },
    {
      title: "Prayer Times",
      subtitle: "Today's schedule",
      icon: "time",
      iconType: "Ionicons",
      color: "#f97316",
      action: () => {},
    },
    {
      title: "Duas",
      subtitle: "Daily supplications",
      icon: "emoji-people",
      iconType: "MaterialIcons",
      color: "#14b8a6",
      action: () => {},
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View
          style={{
            backgroundColor: "#059669",
            marginHorizontal: 16,
            marginTop: 24,
            borderRadius: 16,
            padding: 24,
            shadowColor: "#000",
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
                style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
              >
                Welcome to Al-Quran
              </Text>
              <Text style={{ color: "#bbf7d0", fontSize: 14 }}>
                Read, Reflect, Remember
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
              <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
                Continue Reading
              </Text>
              <Text style={{ color: "#bbf7d0", fontSize: 14 }}>
                Pick up where you left off
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <View style={{ marginHorizontal: 16, marginTop: 24 }}>
          <Text
            style={{
              color: "#1f2937",
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            Quick Actions
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
                  }}
                >
                  {action.title}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
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
              color: "#1f2937",
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            Recent Activity
          </Text>

          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 2,
              borderWidth: 1,
              borderColor: "#f3f4f6",
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
                  backgroundColor: "#f0fdf4",
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons name="history" size={20} color="#059669" />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: "#1f2937", fontWeight: "600" }}>
                  Last Read
                </Text>
                <Text style={{ color: "#6b7280", fontSize: 14 }}>
                  Surah Al-Fatiha - Verse 7
                </Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: "#e5e7eb",
                marginVertical: 12,
              }}
            />

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "#eff6ff",
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="bookmark" size={20} color="#3b82f6" />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: "#1f2937", fontWeight: "600" }}>
                  Bookmarked
                </Text>
                <Text style={{ color: "#6b7280", fontSize: 14 }}>
                  3 verses saved today
                </Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Daily Verse */}
        <View style={{ marginHorizontal: 16, marginTop: 24 }}>
          <Text
            style={{
              color: "#1f2937",
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            Verse of the Day
          </Text>

          <View
            style={{
              backgroundColor: "#8b5cf6",
              borderRadius: 16,
              padding: 24,
              shadowColor: "#000",
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
                }}
              >
                "And whoever relies upon Allah - then He is sufficient for him."
              </Text>
              <Text style={{ color: "#c4b5fd", fontSize: 14, marginTop: 12 }}>
                — Quran 65:3
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
                style={{ color: "white", fontWeight: "600", marginLeft: 8 }}
              >
                Share Verse
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
