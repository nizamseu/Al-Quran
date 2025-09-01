import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import CustomTabBar from "../components/CustomTabBar";

export default function Home() {
  const quickActions = [
    {
      title: "Start Reading",
      subtitle: "Continue your journey",
      icon: "book",
      iconType: "Ionicons",
      color: "bg-blue-500",
      action: () => router.push("/sura-list"),
    },
    {
      title: "Bookmarks",
      subtitle: "Saved verses",
      icon: "bookmark",
      iconType: "Ionicons",
      color: "bg-purple-500",
      action: () => {},
    },
    {
      title: "Prayer Times",
      subtitle: "Today's schedule",
      icon: "time",
      iconType: "Ionicons",
      color: "bg-orange-500",
      action: () => {},
    },
    {
      title: "Duas",
      subtitle: "Daily supplications",
      icon: "emoji-people",
      iconType: "MaterialIcons",
      color: "bg-teal-500",
      action: () => {},
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Main Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View className="bg-gradient-to-br from-green-600 to-emerald-700 mx-4 mt-6 rounded-2xl p-6 shadow-lg">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
              <MaterialIcons name="book" size={24} color="white" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-white text-lg font-bold">
                Welcome to Al-Quran
              </Text>
              <Text className="text-green-100 text-sm">
                Read, Reflect, Remember
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/sura-list")}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex-row items-center justify-between"
          >
            <View>
              <Text className="text-white font-semibold text-base">
                Continue Reading
              </Text>
              <Text className="text-green-100 text-sm">
                Pick up where you left off
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <View className="mx-4 mt-6">
          <Text className="text-gray-800 text-xl font-bold mb-4">
            Quick Actions
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={action.action}
                className={`w-[48%] ${action.color} rounded-2xl p-4 mb-4 shadow-md`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mb-3">
                  {action.iconType === "Ionicons" ? (
                    <Ionicons name={action.icon} size={20} color="white" />
                  ) : (
                    <MaterialIcons name={action.icon} size={20} color="white" />
                  )}
                </View>

                <Text className="text-white font-semibold text-base mb-1">
                  {action.title}
                </Text>
                <Text className="text-white/80 text-sm">{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View className="mx-4 mt-6">
          <Text className="text-gray-800 text-xl font-bold mb-4">
            Recent Activity
          </Text>

          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
                <MaterialIcons name="history" size={20} color="#059669" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-gray-800 font-semibold">Last Read</Text>
                <Text className="text-gray-500 text-sm">
                  Surah Al-Fatiha - Verse 7
                </Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View className="h-px bg-gray-200 my-3" />

            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                <Ionicons name="bookmark" size={20} color="#3b82f6" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-gray-800 font-semibold">Bookmarked</Text>
                <Text className="text-gray-500 text-sm">
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
        <View className="mx-4 mt-6">
          <Text className="text-gray-800 text-xl font-bold mb-4">
            Verse of the Day
          </Text>

          <View className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 shadow-lg">
            <View className="items-center mb-4">
              <Text className="text-white text-center text-lg leading-relaxed font-medium">
                "And whoever relies upon Allah - then He is sufficient for him."
              </Text>
              <Text className="text-purple-100 text-sm mt-3">— Quran 65:3</Text>
            </View>

            <TouchableOpacity className="bg-white/20 rounded-xl p-3 flex-row items-center justify-center">
              <Ionicons name="share-outline" size={18} color="white" />
              <Text className="text-white font-semibold ml-2">Share Verse</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Custom Tab Bar */}
      <CustomTabBar />
    </View>
  );
}
