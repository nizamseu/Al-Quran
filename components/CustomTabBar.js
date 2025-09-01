import React from "react";
import { View, TouchableOpacity, Text, Dimensions } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";

const { width } = Dimensions.get("window");

const CustomTabBar = () => {
  const pathname = usePathname();

  const tabs = [
    {
      name: "index",
      label: "Home",
      icon: "home",
      iconType: "Ionicons",
      route: "/",
    },
    {
      name: "sura-list",
      label: "Suras",
      icon: "list",
      iconType: "MaterialIcons",
      route: "/sura-list",
    },
    {
      name: "settings",
      label: "Settings",
      icon: "settings",
      iconType: "Ionicons",
      route: "/settings",
    },
  ];

  const isActive = (route) => {
    return pathname === route;
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200"
      style={{
        height: 80,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      <View className="flex-row items-center justify-around h-full px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.route);

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => router.push(tab.route)}
              className="flex-1 items-center justify-center"
              style={{ minHeight: 60 }}
            >
              {/* Icon Container */}
              <View
                className={`w-12 h-12 items-center justify-center rounded-2xl mb-1 ${
                  active ? "bg-green-100" : "bg-transparent"
                }`}
                style={{
                  transform: active ? [{ scale: 1.1 }] : [{ scale: 1 }],
                }}
              >
                {tab.iconType === "Ionicons" ? (
                  <Ionicons
                    name={active ? tab.icon : `${tab.icon}-outline`}
                    size={24}
                    color={active ? "#059669" : "#9ca3af"}
                  />
                ) : (
                  <MaterialIcons
                    name={tab.icon}
                    size={24}
                    color={active ? "#059669" : "#9ca3af"}
                  />
                )}
              </View>

              {/* Label */}
              <Text
                className={`text-xs font-medium ${
                  active ? "text-green-600" : "text-gray-400"
                }`}
                style={{ marginBottom: 4 }}
              >
                {tab.label}
              </Text>

              {/* Active Indicator */}
              {active && (
                <View
                  className="w-1 h-1 bg-green-600 rounded-full"
                  style={{ position: "absolute", bottom: 8 }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default CustomTabBar;
