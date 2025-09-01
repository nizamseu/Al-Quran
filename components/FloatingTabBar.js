import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";

const { width } = Dimensions.get("window");

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const animatedValue = useRef(new Animated.Value(0)).current;

  const tabWidth = (width - 40) / 3; // 3 tabs, 40px margin (20px each side)

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: state.index * tabWidth,
      useNativeDriver: false,
      tension: 300,
      friction: 30,
    }).start();
  }, [state.index, tabWidth]);

  const getTabIcon = (routeName, focused) => {
    const iconProps = {
      size: focused ? 24 : 20,
      color: focused ? "#FFFFFF" : colors.textSecondary,
    };

    switch (routeName) {
      case "index":
        return (
          <Ionicons name={focused ? "home" : "home-outline"} {...iconProps} />
        );
      case "sura-list":
        return <MaterialIcons name="format-list-bulleted" {...iconProps} />;
      case "settings":
        return (
          <Ionicons
            name={focused ? "settings" : "settings-outline"}
            {...iconProps}
          />
        );
      default:
        return null;
    }
  };

  const getTabLabel = (routeName) => {
    switch (routeName) {
      case "index":
        return t("navigation.home");
      case "sura-list":
        return t("navigation.suraList");
      case "settings":
        return t("navigation.settings");
      default:
        return "";
    }
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        height: 70,
        backgroundColor: isDark ? colors.surface : "#FFFFFF",
        borderRadius: 35,
        shadowColor: isDark ? "#000" : colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.8 : 0.3,
        shadowRadius: 20,
        elevation: 15,
        borderWidth: 1,
        borderColor: isDark ? colors.border : colors.primary + "10",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
      }}
    >
      {/* Animated Background Indicator */}
      <Animated.View
        style={{
          position: "absolute",
          left: animatedValue,
          marginLeft: 8,
          top: 8,
          bottom: 8,
          width: tabWidth - 16,
          backgroundColor: colors.primary,
          borderRadius: 27,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
      />

      {/* Tab Items */}
      {state.routes.map((route, index) => {
        if (route.name === "sura/[id]") return null; // Skip hidden routes

        const { options } = descriptors[route.key];
        const label = getTabLabel(route.name);
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.8}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 12,
            }}
          >
            {/* Icon with Animation */}
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: isFocused ? 1.1 : 0.9 }],
                marginBottom: 4,
              }}
            >
              {getTabIcon(route.name, isFocused)}
            </View>

            {/* Label */}
            <Text
              style={{
                fontSize: 10,
                fontWeight: isFocused ? "800" : "600",
                color: isFocused ? "#FFFFFF" : colors.textSecondary,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                textShadowColor: isFocused ? "rgba(0,0,0,0.3)" : "transparent",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              {label}
            </Text>

            {/* Active Indicator Dot */}
            {isFocused && (
              <View
                style={{
                  position: "absolute",
                  top: 8,
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.8)",
                }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
