import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useFont } from "../contexts/FontContext";

export default function Settings() {
  const { colors, themeMode, changeTheme, isDark } = useTheme();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const {
    fontFamily,
    fontSize,
    changeFontFamily,
    changeFontSize,
    fontFamilies,
    fontSizes,
    getTextStyle,
  } = useFont();

  const [arabicText, setArabicText] = useState(true);
  const [translation, setTranslation] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showFontFamilyModal, setShowFontFamilyModal] = useState(false);
  const [showFontSizeModal, setShowFontSizeModal] = useState(false);

  const getThemeDisplayName = (mode) => {
    switch (mode) {
      case "light":
        return t("settings.theme.light");
      case "dark":
        return t("settings.theme.dark");
      case "system":
        return t("settings.theme.system");
      default:
        return t("settings.theme.system");
    }
  };

  const settingsSections = [
    {
      title: t("settings.sections.appearance"),
      items: [
        {
          label: t("settings.language.title"),
          icon: "language",
          iconType: "Ionicons",
          type: "navigation",
          value: currentLanguage === "bn" ? "বাংলা" : "English",
          onPress: () => setShowLanguageModal(true),
        },
        {
          label: t("settings.theme.title"),
          icon: isDark ? "moon" : "sunny",
          iconType: "Ionicons",
          type: "navigation",
          value: getThemeDisplayName(themeMode),
          onPress: () => setShowThemeModal(true),
        },
        {
          label: t("settings.font.family"),
          icon: "text",
          iconType: "Ionicons",
          type: "navigation",
          value: fontFamilies[fontFamily]?.name || "System Default",
          onPress: () => setShowFontFamilyModal(true),
        },
        {
          label: t("settings.font.size"),
          icon: "text-outline",
          iconType: "Ionicons",
          type: "navigation",
          value: fontSizes[fontSize]?.name || "Medium",
          onPress: () => setShowFontSizeModal(true),
        },
      ],
    },
    {
      title: t("settings.sections.reading"),
      items: [
        {
          label: t("settings.reading.arabicText"),
          icon: "language",
          iconType: "MaterialIcons",
          type: "switch",
          value: arabicText,
          onToggle: setArabicText,
        },
        {
          label: t("settings.reading.showTranslation"),
          icon: "translate",
          iconType: "MaterialIcons",
          type: "switch",
          value: translation,
          onToggle: setTranslation,
        },
      ],
    },
    {
      title: t("settings.sections.audio"),
      items: [
        {
          label: t("settings.audio.defaultReciter"),
          icon: "volume-high",
          iconType: "Ionicons",
          type: "navigation",
          value: "Al-Afasy",
        },
        {
          label: t("settings.audio.quality"),
          icon: "musical-notes",
          iconType: "Ionicons",
          type: "navigation",
          value: t("settings.audio.high"),
        },
        {
          label: t("settings.audio.autoplay"),
          icon: "play-forward",
          iconType: "Ionicons",
          type: "switch",
          value: true,
          onToggle: () => {},
        },
      ],
    },
    {
      title: t("settings.sections.notifications"),
      items: [
        {
          label: t("settings.notifications.enable"),
          icon: "notifications",
          iconType: "Ionicons",
          type: "switch",
          value: notifications,
          onToggle: setNotifications,
        },
      ],
    },
    {
      title: t("settings.sections.about"),
      items: [
        {
          label: t("settings.about.version"),
          icon: "information-circle",
          iconType: "Ionicons",
          type: "info",
          value: "1.0.0",
        },
        {
          label: t("settings.about.privacy"),
          icon: "shield-checkmark",
          iconType: "Ionicons",
          type: "navigation",
        },
        {
          label: t("settings.about.terms"),
          icon: "document-text",
          iconType: "Ionicons",
          type: "navigation",
        },
        {
          label: t("settings.about.rate"),
          icon: "star",
          iconType: "Ionicons",
          type: "navigation",
        },
      ],
    },
  ];

  const renderSettingItem = (item, index) => {
    return (
      <View key={index}>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 16,
            paddingHorizontal: 16,
            opacity: item.type === "info" ? 0.6 : 1,
          }}
          disabled={item.type === "info"}
          onPress={item.onPress}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View
              style={{
                width: 40,
                height: 40,
                backgroundColor: colors.primaryLight + "20",
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              {item.iconType === "Ionicons" ? (
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              ) : (
                <MaterialIcons
                  name={item.icon}
                  size={20}
                  color={colors.primary}
                />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  ...getTextStyle("subtitle", "medium"),
                  color: colors.text,
                }}
              >
                {item.label}
              </Text>
              {item.value && item.type !== "switch" && (
                <Text
                  style={{
                    ...getTextStyle("body"),
                    color: colors.textSecondary,
                    marginTop: 4,
                  }}
                >
                  {item.value}
                </Text>
              )}
            </View>
          </View>

          <View style={{ marginLeft: 16 }}>
            {item.type === "switch" ? (
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{
                  false: colors.border,
                  true: colors.primaryLight + "80",
                }}
                thumbColor={item.value ? colors.primary : colors.textTertiary}
                ios_backgroundColor={colors.border}
              />
            ) : item.type === "navigation" ? (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textTertiary}
              />
            ) : null}
          </View>
        </TouchableOpacity>

        {index <
          settingsSections.find((s) => s.items.includes(item))?.items.length -
            1 && (
          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginLeft: 56,
            }}
          />
        )}
      </View>
    );
  };

  const renderModal = (
    visible,
    setVisible,
    title,
    options,
    currentValue,
    onSelect
  ) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setVisible(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 20,
            maxHeight: "80%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              style={{
                ...getTextStyle("title", "bold"),
                color: colors.text,
              }}
            >
              {title}
            </Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  backgroundColor:
                    item.value === currentValue
                      ? colors.primaryLight + "20"
                      : "transparent",
                }}
                onPress={() => {
                  onSelect(item.value);
                  setVisible(false);
                }}
              >
                <Text
                  style={{
                    ...getTextStyle("subtitle", "medium"),
                    color:
                      item.value === currentValue
                        ? colors.primary
                        : colors.text,
                  }}
                >
                  {item.label}
                </Text>
                {item.value === currentValue && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View
          style={{
            backgroundColor: colors.primary,
            marginHorizontal: 16,
            marginTop: 24,
            borderRadius: 16,
            padding: 24,
            ...colors.shadows?.medium,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 40,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <MaterialIcons name="person" size={40} color="white" />
            </View>
            <Text
              style={{
                ...getTextStyle("display", "bold"),
                color: "white",
                marginBottom: 8,
              }}
            >
              {t("settings.profile.welcome")}
            </Text>
            <Text
              style={{
                ...getTextStyle("body"),
                color: "#bbf7d0",
              }}
            >
              {t("settings.profile.progress")}
            </Text>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View
            key={sectionIndex}
            style={{ marginHorizontal: 16, marginTop: 24 }}
          >
            <Text
              style={{
                ...getTextStyle("title", "bold"),
                color: colors.text,
                marginBottom: 12,
                marginLeft: 4,
              }}
            >
              {section.title}
            </Text>

            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                ...colors.shadows?.small,
              }}
            >
              {section.items.map((item, itemIndex) =>
                renderSettingItem(item, itemIndex)
              )}
            </View>
          </View>
        ))}

        {/* Footer */}
        <View style={{ marginHorizontal: 16, marginTop: 32, marginBottom: 16 }}>
          <View
            style={{
              backgroundColor: colors.primaryLight + "20",
              borderRadius: 16,
              padding: 24,
              borderWidth: 1,
              borderColor: colors.primaryLight + "40",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <MaterialIcons name="book" size={32} color={colors.primary} />
              <Text
                style={{
                  ...getTextStyle("title", "bold"),
                  color: colors.primaryDark,
                  marginTop: 12,
                  marginBottom: 8,
                }}
              >
                {t("app.name")}
              </Text>
              <Text
                style={{
                  ...getTextStyle("body"),
                  color: colors.textSecondary,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                {t("settings.footer.description")}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Language Modal */}
      {renderModal(
        showLanguageModal,
        setShowLanguageModal,
        t("settings.language.title"),
        [
          { value: "bn", label: "বাংলা" },
          { value: "en", label: "English" },
        ],
        currentLanguage,
        changeLanguage
      )}

      {/* Theme Modal */}
      {renderModal(
        showThemeModal,
        setShowThemeModal,
        t("settings.theme.title"),
        [
          { value: "light", label: t("settings.theme.light") },
          { value: "dark", label: t("settings.theme.dark") },
          { value: "system", label: t("settings.theme.system") },
        ],
        themeMode,
        changeTheme
      )}

      {/* Font Family Modal */}
      {renderModal(
        showFontFamilyModal,
        setShowFontFamilyModal,
        t("settings.font.family"),
        Object.keys(fontFamilies).map((key) => ({
          value: key,
          label: fontFamilies[key].name,
        })),
        fontFamily,
        changeFontFamily
      )}

      {/* Font Size Modal */}
      {renderModal(
        showFontSizeModal,
        setShowFontSizeModal,
        t("settings.font.size"),
        Object.keys(fontSizes).map((key) => ({
          value: key,
          label: fontSizes[key].name,
        })),
        fontSize,
        changeFontSize
      )}
    </View>
  );
}
