import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useFont } from "../../contexts/FontContext";

// Sample sura data
const suraList = [
  {
    id: 1,
    name: "Al-Fatiha",
    englishName: "The Opening",
    verses: 7,
    revelation: "Meccan",
  },
  {
    id: 2,
    name: "Al-Baqarah",
    englishName: "The Cow",
    verses: 286,
    revelation: "Medinan",
  },
  {
    id: 3,
    name: "Aal-e-Imran",
    englishName: "Family of Imran",
    verses: 200,
    revelation: "Medinan",
  },
  {
    id: 4,
    name: "An-Nisa",
    englishName: "The Women",
    verses: 176,
    revelation: "Medinan",
  },
  {
    id: 5,
    name: "Al-Maidah",
    englishName: "The Table",
    verses: 120,
    revelation: "Medinan",
  },
  {
    id: 6,
    name: "Al-Anam",
    englishName: "The Cattle",
    verses: 165,
    revelation: "Meccan",
  },
  {
    id: 7,
    name: "Al-Araf",
    englishName: "The Heights",
    verses: 206,
    revelation: "Meccan",
  },
  {
    id: 8,
    name: "Al-Anfal",
    englishName: "The Spoils of War",
    verses: 75,
    revelation: "Medinan",
  },
  {
    id: 9,
    name: "At-Tawbah",
    englishName: "The Repentance",
    verses: 129,
    revelation: "Medinan",
  },
  {
    id: 10,
    name: "Yunus",
    englishName: "Jonah",
    verses: 109,
    revelation: "Meccan",
  },
];

export default function SuraScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const { getTextStyle } = useFont();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSuras, setFilteredSuras] = useState(suraList);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredSuras(suraList);
    } else {
      const filtered = suraList.filter(
        (sura) =>
          sura.name.toLowerCase().includes(query.toLowerCase()) ||
          sura.englishName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuras(filtered);
    }
  };

  const renderSuraItem = ({ item }) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        shadowColor: isDark ? colors.text : "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: colors.border,
        borderColor: "#f3f4f6",
      }}
      onPress={() => router.push(`/sura/${item.id}`)}
    >
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
        <View
          style={{
            width: 48,
            height: 48,
            backgroundColor: isDark ? "rgba(16, 185, 129, 0.1)" : "#f0fdf4",
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 16,
          }}
        >
          <Text
            style={{
              color: colors.primary,
              fontWeight: "bold",
              fontSize: 16,
              ...getTextStyle("subtitle", "bold"),
            }}
          >
            {item.id}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 4,
              ...getTextStyle("title", "bold"),
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              marginBottom: 4,
              ...getTextStyle("body"),
            }}
          >
            {item.englishName}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Ionicons
                name="document-text-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginLeft: 4,
                  ...getTextStyle("caption"),
                }}
              >
                {item.verses} {t("suraList.totalVerses")}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons
                name={item.revelation === "Meccan" ? "location-city" : "domain"}
                size={14}
                color={colors.textSecondary}
              />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginLeft: 4,
                  ...getTextStyle("caption"),
                }}
              >
                {t(`suraList.revelation.${item.revelation.toLowerCase()}`)}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
      {/* Search Bar */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          shadowColor: isDark ? colors.text : "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginBottom: 16,
        }}
      >
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={{
            flex: 1,
            marginLeft: 12,
            color: colors.text,
            fontSize: 16,
            ...getTextStyle("body"),
          }}
          placeholder={t("suraList.searchPlaceholder")}
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Stats */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "#3b82f6",
            borderRadius: 12,
            padding: 16,
            flex: 1,
            marginRight: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <MaterialIcons name="book" size={20} color="white" />
            <Text
              style={{
                color: "white",
                fontSize: 14,
                fontWeight: "500",
                marginLeft: 8,
              }}
            >
              Total Suras
            </Text>
          </View>
          <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>
            114
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#8b5cf6",
            borderRadius: 12,
            padding: 16,
            flex: 1,
            marginLeft: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <MaterialIcons name="format-quote" size={20} color="white" />
            <Text
              style={{
                color: "white",
                fontSize: 14,
                fontWeight: "500",
                marginLeft: 8,
              }}
            >
              Total Verses
            </Text>
          </View>
          <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>
            6,236
          </Text>
        </View>
      </View>

      <Text
        style={{
          color: "#1f2937",
          fontSize: 20,
          fontWeight: "bold",
          marginBottom: 8,
        }}
      >
        All Suras {searchQuery && `(${filteredSuras.length} found)`}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={filteredSuras}
        renderItem={renderSuraItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 140 }}
      />
    </View>
  );
}
