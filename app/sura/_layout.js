import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "../../contexts/LanguageContext";
import { useFont } from "../../contexts/FontContext";
import { useTheme } from "../../contexts/ThemeContext";

const Layout = () => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const { getTextStyle } = useFont();

  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          headerBackVisible: true,
          headerBackTitleVisible: false,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            ...getTextStyle("subtitle", "semiBold"),
            color: colors.text,
          },
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
};

export default Layout;
