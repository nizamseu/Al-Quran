import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
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
                    headerTitleAlign: "center",
                    // headerTitleStyle: {
                    //     ...getTextStyle("subtitle", "semiBold"),
                    //     color: colors.text,
                    // },
                }}
            />
        </Stack>
    );
};

export default Layout;
