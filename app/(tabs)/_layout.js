import { Tabs } from "expo-router/tabs";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { View } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#059669",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          height: 70,
          paddingBottom: 5,
          paddingTop: 10,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: "#059669",
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        headerTintColor: "white",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
        headerTitleAlign: "center",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Al-Quran",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: focused ? "#f0fdf4" : "transparent",
              }}
            >
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={focused ? 26 : 24}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="sura-list"
        options={{
          title: "Sura List",
          tabBarLabel: "Suras",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: focused ? "#f0fdf4" : "transparent",
              }}
            >
              <MaterialIcons
                name="list"
                size={focused ? 26 : 24}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: focused ? "#f0fdf4" : "transparent",
              }}
            >
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={focused ? 26 : 24}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
const d = {
  availableLanguages: ["en", "bn"],
  availableTafsir: { bn: 4, en: 3 },
  availableTranslations: { bn: 5, en: 3 },
  meccanSuras: 86,
  medinanSuras: 28,
  totalSuras: 114,
  totalVerses: 6236,
};
