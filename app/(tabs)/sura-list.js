import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useFont } from "../../contexts/FontContext";
import { useSettings } from "../../contexts/SettingsContext";
import { useSearch } from "../../contexts/SearchContext";
import dataService from "../../services/dataService";

export default function SuraScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const { getTextStyle } = useFont();
  const { settings, updateLastRead } = useSettings();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    addToSearchHistory,
    getPopularSearches,
    getSuggestions,
  } = useSearch();

  const [suraList, setSuraList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("chronological"); // chronological, alphabetical, verses
  const [filterBy, setFilterBy] = useState("all"); // all, meccan, medinan
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  useEffect(() => {
    loadSuraData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const suggestions = getSuggestions(searchQuery);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  const loadSuraData = async () => {
    try {
      const allSuras = dataService.getAllSuras();
      setSuraList(allSuras);
    } catch (error) {
      console.error("Error loading sura data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedSuras = useMemo(() => {
    let result = searchQuery.trim() ? searchResults.suras : suraList;

    // Apply revelation filter
    if (filterBy !== "all") {
      result = result.filter((sura) => sura.revelationPlace === filterBy);
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return a.name.localeCompare(b.name);
        case "verses":
          return b.versesCount - a.versesCount;
        case "chronological":
        default:
          return a.revelationOrder - b.revelationOrder;
      }
    });

    return result;
  }, [suraList, searchQuery, searchResults, filterBy, sortBy]);

  const handleSuraPress = async (sura) => {
    await updateLastRead(sura.id, 1);
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery);
    }
    router.push(`/sura/${sura.id}`);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery);
    }
  };

  const getDisplayName = (sura) => {
    switch (settings.languagePreference) {
      case "bn":
        return sura.nameBengali || sura.name;
      case "ar":
        return sura.nameArabic;
      default:
        return sura.name;
    }
  };

  const getSubtitle = (sura) => {
    switch (settings.languagePreference) {
      case "bn":
        return sura.name;
      case "ar":
        return sura.name;
      default:
        return sura.nameSimple;
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={{
            color: colors.text,
            marginTop: 10,
            ...getTextStyle("body"),
          }}
        >
          {t("common.loading")}
        </Text>
      </View>
    );
  }

  const renderSuraItem = ({ item }) => {
    const isLastRead = settings.lastRead?.suraId === item.id;

    return (
      <TouchableOpacity
        style={{
          backgroundColor: isLastRead ? colors.primaryLight : colors.surface,
          marginHorizontal: 16,
          marginBottom: 12,
          borderRadius: 16,
          shadowColor: isDark ? colors.text : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 3.84,
          elevation: 5,
          borderWidth: 1,
          borderColor: isLastRead ? colors.primary : colors.border,
        }}
        onPress={() => handleSuraPress(item)}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
          }}
        >
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: "bold",
                  flex: 1,
                  ...getTextStyle("title", "bold"),
                }}
              >
                {getDisplayName(item)}
              </Text>
              {isLastRead && (
                <View
                  style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 10,
                    marginLeft: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  >
                    {t("suraList.lastRead")}
                  </Text>
                </View>
              )}
            </View>

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                marginBottom: 4,
                ...getTextStyle("body"),
              }}
            >
              {getSubtitle(item)}
            </Text>

            {settings.languagePreference === "en" ||
            settings.languagePreference === "bn" ? (
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 16,
                  marginBottom: 8,
                  textAlign: "right",
                  fontFamily: "System",
                }}
              >
                {item.nameArabic}
              </Text>
            ) : null}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
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
                  {item.versesCount} {t("suraList.totalVerses")}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 16,
                }}
              >
                <MaterialIcons
                  name={
                    item.revelationPlace === "makkah"
                      ? "location-city"
                      : "domain"
                  }
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
                  {t(
                    `suraList.revelation.${item.revelationPlace?.toLowerCase() || "unknown"}`
                  )}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialIcons
                  name="format-list-numbered"
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
                  #{item.revelationOrder}
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
  };

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
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={{ marginLeft: 8 }}
        >
          <Ionicons name="options" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Search Suggestions */}
      {searchSuggestions.length > 0 && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {searchSuggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={suggestion.id}
              style={{
                padding: 12,
                borderBottomWidth: index < searchSuggestions.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}
              onPress={() => {
                setSearchQuery(suggestion.title);
                handleSearchSubmit();
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontWeight: "bold",
                }}
              >
                {suggestion.title}
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                }}
              >
                {suggestion.subtitle} • {suggestion.versesCount} verses
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

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
              {t("suraList.totalSuras")}
            </Text>
          </View>
          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
            }}
          >
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
              {t("suraList.totalVerses")}
            </Text>
          </View>
          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
            }}
          >
            6,236
          </Text>
        </View>
      </View>

      {/* Filter and Sort Bar */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 20,
            fontWeight: "bold",
            ...getTextStyle("title", "bold"),
          }}
        >
          {t("suraList.allSuras")}{" "}
          {searchQuery &&
            `(${filteredAndSortedSuras.length} ${t("common.found")})`}
        </Text>

        {!searchQuery && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.surface,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.border,
                marginLeft: 8,
              }}
              onPress={() => setShowFilters(true)}
            >
              <Text style={{ color: colors.text, fontSize: 12 }}>
                {t(`suraList.sort.${sortBy}`)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: "70%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colors.text,
                ...getTextStyle("title", "bold"),
              }}
            >
              {t("suraList.filtersAndSort")}
            </Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Sort Options */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 12,
                ...getTextStyle("subtitle", "bold"),
              }}
            >
              {t("suraList.sortBy")}
            </Text>

            {["chronological", "alphabetical", "verses"].map((option) => (
              <TouchableOpacity
                key={option}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor:
                    sortBy === option ? colors.primaryLight : "transparent",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
                onPress={() => setSortBy(option)}
              >
                <Ionicons
                  name={
                    sortBy === option ? "radio-button-on" : "radio-button-off"
                  }
                  size={20}
                  color={
                    sortBy === option ? colors.primary : colors.textSecondary
                  }
                />
                <Text
                  style={{
                    marginLeft: 12,
                    color: sortBy === option ? colors.primary : colors.text,
                    ...getTextStyle("body"),
                  }}
                >
                  {t(`suraList.sort.${option}`)}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Filter Options */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginTop: 20,
                marginBottom: 12,
                ...getTextStyle("subtitle", "bold"),
              }}
            >
              {t("suraList.filterBy")}
            </Text>

            {["all", "makkah", "madinah"].map((option) => (
              <TouchableOpacity
                key={option}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor:
                    filterBy === option ? colors.primaryLight : "transparent",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
                onPress={() => setFilterBy(option)}
              >
                <Ionicons
                  name={
                    filterBy === option ? "radio-button-on" : "radio-button-off"
                  }
                  size={20}
                  color={
                    filterBy === option ? colors.primary : colors.textSecondary
                  }
                />
                <Text
                  style={{
                    marginLeft: 12,
                    color: filterBy === option ? colors.primary : colors.text,
                    ...getTextStyle("body"),
                  }}
                >
                  {option === "all"
                    ? t("common.all")
                    : t(`suraList.revelation.${option}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={filteredAndSortedSuras}
        renderItem={renderSuraItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 140 }}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
      {renderFiltersModal()}
    </View>
  );
}
