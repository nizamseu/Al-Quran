import { Tabs } from "expo-router/tabs";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { View, Text } from "react-native";

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
          paddingBottom: 10,
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
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              className={`items-center justify-center w-12 h-12 rounded-full ${focused ? "bg-green-100" : ""}`}
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
          title: "Suras",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              className={`items-center justify-center w-12 h-12 rounded-full ${focused ? "bg-green-100" : ""}`}
            >
              <MaterialIcons
                name={focused ? "list" : "list"}
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
          tabBarIcon: ({ color, size, focused }) => (
            <View
              className={`items-center justify-center w-12 h-12 rounded-full ${focused ? "bg-green-100" : ""}`}
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

      <Tabs.Screen
        name="sura/[id]"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
