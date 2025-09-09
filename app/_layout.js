import { Drawer } from "expo-router/drawer";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Platform,
} from "react-native";
import { router, Stack } from "expo-router";
import { LanguageProvider } from "../contexts/LanguageContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { FontProvider } from "../contexts/FontContext";
import { SettingsProvider } from "../contexts/SettingsContext";
import { SearchProvider } from "../contexts/SearchContext";
import { AudioProvider } from "../contexts/AudioContext";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useFont } from "../contexts/FontContext";
import GlobalAudioPlayer from "../components/GlobalAudioPlayer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

// Custom beautiful drawer content
function CustomDrawerContent(props) {
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();
    const { getTextStyle } = useFont();

    const routes = [
        {
            name: "index",
            label: t("navigation.home"),
            icon: "home",
            iconType: "Ionicons",
        },
        {
            name: "sura-list",
            label: t("navigation.suraList"),
            icon: "list",
            iconType: "MaterialIcons",
        },
        {
            name: "settings",
            label: t("navigation.settings"),
            icon: "settings",
            iconType: "Ionicons",
        },
    ];

    return (
        <View style={{ flex: 1 }}>
            {/* Beautiful Header */}
            <View
                style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: 24,
                    paddingVertical: 48,
                    shadowColor: isDark ? colors.text : "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                }}
            >
                <View style={{ alignItems: "center" }}>
                    {/* App Logo/Icon */}
                    <View
                        style={{
                            width: 80,
                            height: 80,
                            backgroundColor: "rgba(255,255,255,0.2)",
                            borderRadius: 40,
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 16,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 8,
                        }}
                    >
                        <MaterialIcons name="book" size={40} color="white" />
                    </View>

                    {/* App Name */}
                    <Text
                        style={{
                            ...getTextStyle("display", "bold"),
                            color: "white",
                            marginBottom: 4,
                        }}
                    >
                        {t("app.name")}
                    </Text>
                    <Text
                        style={{
                            ...getTextStyle("subtitle", "medium"),
                            color: "#bbf7d0",
                            marginBottom: 8,
                        }}
                    >
                        {t("app.nameArabic")}
                    </Text>
                    <Text
                        style={{
                            ...getTextStyle("body"),
                            color: "#86efac",
                            opacity: 0.9,
                        }}
                    >
                        {t("app.subtitle")}
                    </Text>

                    {/* Decorative line */}
                    <View
                        style={{
                            width: 64,
                            height: 2,
                            backgroundColor: "rgba(255,255,255,0.3)",
                            marginTop: 16,
                            borderRadius: 1,
                        }}
                    />
                </View>
            </View>

            {/* Navigation Items */}
            <ScrollView
                style={{ flex: 1, backgroundColor: colors.background }}
                contentContainerStyle={{ paddingTop: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {routes.map((route, index) => {
                    const isActive =
                        props.state.routes[props.state.index]?.name ===
                        route.name;

                    return (
                        <TouchableOpacity
                            key={route.name}
                            onPress={() => router.push(`/${route.name}`)}
                            style={{
                                marginHorizontal: 16,
                                marginBottom: 8,
                                borderRadius: 12,
                                flexDirection: "row",
                                alignItems: "center",
                                paddingHorizontal: 16,
                                paddingVertical: 16,
                                backgroundColor: isActive
                                    ? colors.primaryLight + "20"
                                    : "transparent",
                                borderLeftWidth: isActive ? 4 : 0,
                                borderLeftColor: colors.primary,
                                shadowColor: isActive
                                    ? colors.primary
                                    : "transparent",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: isActive ? 3 : 0,
                            }}
                        >
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: isActive
                                        ? colors.primary
                                        : colors.border,
                                }}
                            >
                                {route.iconType === "Ionicons" ? (
                                    <Ionicons
                                        name={route.icon}
                                        size={20}
                                        color={
                                            isActive
                                                ? "white"
                                                : colors.textSecondary
                                        }
                                    />
                                ) : (
                                    <MaterialIcons
                                        name={route.icon}
                                        size={20}
                                        color={
                                            isActive
                                                ? "white"
                                                : colors.textSecondary
                                        }
                                    />
                                )}
                            </View>

                            <Text
                                style={{
                                    ...getTextStyle("subtitle", "medium"),
                                    marginLeft: 16,
                                    color: isActive
                                        ? colors.primaryDark
                                        : colors.text,
                                }}
                            >
                                {route.label}
                            </Text>

                            {isActive && (
                                <View style={{ marginLeft: "auto" }}>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={16}
                                        color={colors.primary}
                                    />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}

                {/* Footer Section */}
                <View
                    style={{
                        marginTop: 32,
                        marginHorizontal: 16,
                        paddingTop: 24,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                    }}
                >
                    <View
                        style={{
                            backgroundColor: colors.primaryLight + "20",
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 16,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 8,
                            }}
                        >
                            <Ionicons
                                name="information-circle"
                                size={20}
                                color={colors.primary}
                            />
                            <Text
                                style={{
                                    ...getTextStyle("subtitle", "semiBold"),
                                    marginLeft: 8,
                                    color: colors.primaryDark,
                                }}
                            >
                                {t("drawer.about")}
                            </Text>
                        </View>
                        <Text
                            style={{
                                ...getTextStyle("body"),
                                color: colors.textSecondary,
                                lineHeight: 20,
                            }}
                        >
                            {t("drawer.aboutText")}
                        </Text>
                    </View>

                    <Text
                        style={{
                            ...getTextStyle("caption"),
                            textAlign: "center",
                            color: colors.textTertiary,
                        }}
                    >
                        {t("app.version")}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

// Layout component with all providers
function LayoutWithProviders() {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <FontProvider>
                    <SettingsProvider>
                        <SearchProvider>
                            <AudioProvider>
                                <Layout />
                                <GlobalAudioPlayer />
                            </AudioProvider>
                        </SearchProvider>
                    </SettingsProvider>
                </FontProvider>
            </ThemeProvider>
        </LanguageProvider>
    );
}

// Main layout component
function Layout() {
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();
    const { getTextStyle } = useFont();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                    drawerStyle: {
                        width: width * 0.85, // 85% of screen width
                        backgroundColor: "transparent",
                    },
                    headerStyle: {
                        backgroundColor: colors.primary,
                        elevation: 4,
                        shadowColor: isDark ? colors.text : "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                    },
                    headerTintColor: "white",
                    headerTitleStyle: {
                        ...getTextStyle("title", "bold"),
                        color: "white",
                    },
                    headerTitleAlign: "center",
                    drawerType: "slide",
                    overlayColor: isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.4)",
                }}
            >
                <Drawer.Screen
                    name="(tabs)"
                    options={{
                        title: t("app.name"),
                        drawerLabel: t("navigation.home"),
                    }}
                />
                <Drawer.Screen
                    name="sura/[id]"
                    options={{
                        drawerItemStyle: { display: "none" },
                        title: t("sura.details"),
                        headerRight: ({ tintColor }) => (
                            <View
                                style={{
                                    flexDirection: "row",
                                    marginRight: 16,
                                }}
                            >
                                <TouchableOpacity style={{ marginRight: 12 }}>
                                    <Ionicons
                                        name="bookmark-outline"
                                        size={22}
                                        color={tintColor}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Ionicons
                                        name="share-outline"
                                        size={22}
                                        color={tintColor}
                                    />
                                </TouchableOpacity>
                            </View>
                        ),
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}

export default LayoutWithProviders;
