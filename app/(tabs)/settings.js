import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [arabicText, setArabicText] = useState(true);
  const [translation, setTranslation] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const settingsSections = [
    {
      title: "Reading Preferences",
      items: [
        {
          label: "Arabic Text",
          icon: "language",
          iconType: "MaterialIcons",
          type: "switch",
          value: arabicText,
          onToggle: setArabicText,
        },
        {
          label: "Show Translation",
          icon: "translate",
          iconType: "MaterialIcons",
          type: "switch",
          value: translation,
          onToggle: setTranslation,
        },
        {
          label: "Font Size",
          icon: "text-format",
          iconType: "MaterialIcons",
          type: "navigation",
          value: "Medium",
        },
      ],
    },
    {
      title: "Audio & Recitation",
      items: [
        {
          label: "Default Reciter",
          icon: "volume-high",
          iconType: "Ionicons",
          type: "navigation",
          value: "Al-Afasy",
        },
        {
          label: "Audio Quality",
          icon: "musical-notes",
          iconType: "Ionicons",
          type: "navigation",
          value: "High",
        },
      ],
    },
    {
      title: "App Preferences",
      items: [
        {
          label: "Dark Mode",
          icon: "moon",
          iconType: "Ionicons",
          type: "switch",
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          label: "Notifications",
          icon: "notifications",
          iconType: "Ionicons",
          type: "switch",
          value: notifications,
          onToggle: setNotifications,
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
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View
              style={{
                width: 40,
                height: 40,
                backgroundColor: "#f3f4f6",
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              {item.iconType === "Ionicons" ? (
                <Ionicons name={item.icon} size={20} color="#059669" />
              ) : (
                <MaterialIcons name={item.icon} size={20} color="#059669" />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{ color: "#1f2937", fontSize: 16, fontWeight: "500" }}
              >
                {item.label}
              </Text>
              {item.value && item.type !== "switch" && (
                <Text style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>
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
                trackColor={{ false: "#e5e7eb", true: "#86efac" }}
                thumbColor={item.value ? "#059669" : "#f3f4f6"}
                ios_backgroundColor="#e5e7eb"
              />
            ) : item.type === "navigation" ? (
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            ) : null}
          </View>
        </TouchableOpacity>

        {index <
          settingsSections.find((s) => s.items.includes(item))?.items.length -
            1 && (
          <View
            style={{ height: 1, backgroundColor: "#e5e7eb", marginLeft: 56 }}
          />
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
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
                color: "white",
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 8,
              }}
            >
              Welcome, User
            </Text>
            <Text style={{ color: "#bbf7d0", fontSize: 14 }}>
              Reading progress: 12 Suras completed
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
                color: "#1f2937",
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 12,
                marginLeft: 4,
              }}
            >
              {section.title}
            </Text>

            <View
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2,
                borderWidth: 1,
                borderColor: "#f3f4f6",
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
              backgroundColor: "#f0fdf4",
              borderRadius: 16,
              padding: 24,
              borderWidth: 1,
              borderColor: "#bbf7d0",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <MaterialIcons name="book" size={32} color="#059669" />
              <Text
                style={{
                  color: "#065f46",
                  fontSize: 18,
                  fontWeight: "bold",
                  marginTop: 12,
                  marginBottom: 8,
                }}
              >
                Al-Quran App
              </Text>
              <Text
                style={{
                  color: "#047857",
                  fontSize: 14,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                Experience the divine words of Allah with beautiful recitation,
                translation, and spiritual guidance.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
