import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Dimensions,
  Modal,
  ScrollView,
  TextInput,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../contexts/ThemeContext";
import { useFont } from "../contexts/FontContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useAudio } from "../contexts/AudioContext";
import MushafReader from "../components/MushafReader";
import dataService from "../services/dataService";
import { getTotalPages, getPageRange } from "../utils/mushafPages";

const { width, height } = Dimensions.get("window");

const MushafScreen = () => {
  const searchParams = useLocalSearchParams();
  const initialPageParam = searchParams.pageNumber || searchParams.page || "1";
  const initialPage = parseInt(initialPageParam, 10) || 1;

  console.log("MushafScreen params:", {
    searchParams,
    initialPageParam,
    initialPage,
  });

  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { getTextStyle } = useFont();
  const { t, currentLanguage } = useLanguage();
  const { playAyah, isPlaying, pauseAudio, resumeAudio } = useAudio();

  const [currentPage, setCurrentPage] = useState(initialPage);
  console.log("MushafScreen currentPage state:", currentPage);

  const [showControls, setShowControls] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showPageNavigator, setShowPageNavigator] = useState(false);
  const [showSuraFilter, setShowSuraFilter] = useState(false);
  const [showParaFilter, setShowParaFilter] = useState(false);
  const [showAyahFilter, setShowAyahFilter] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [pageInput, setPageInput] = useState(currentPage.toString());
  const [suraList, setSuraList] = useState([]);

  const hideControlsTimeout = useRef(null);

  // Get dynamic page range
  const { min: minPage, max: maxPage } = getPageRange();
  const totalPages = getTotalPages();

  console.log("Page configuration:", {
    currentPage,
    minPage,
    maxPage,
    totalPages,
  });

  // Para/Juz data (30 paras)
  const paraList = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    name: `Para ${i + 1}`,
  }));

  useEffect(() => {
    loadBookmarks();
    loadSuraList();
    resetHideControlsTimer();

    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const loadBookmarks = async () => {
    try {
      const savedBookmarks = await dataService.getBookmarks();
      setBookmarks(savedBookmarks || []);
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    }
  };

  const loadSuraList = () => {
    try {
      const suras = dataService.getAllSuras();
      setSuraList(suras);
    } catch (error) {
      console.error("Error loading suras:", error);
    }
  };

  const resetHideControlsTimer = () => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }

    hideControlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleScreenPress = () => {
    setShowControls(true);
    resetHideControlsTimer();
  };

  const navigateToPage = (page) => {
    if (page >= minPage && page <= maxPage) {
      setCurrentPage(page);
      resetHideControlsTimer();
    } else {
      Alert.alert(
        "Invalid Page",
        `Please enter a page number between ${minPage} and ${maxPage}`
      );
    }
  };

  const goToNextPage = () => {
    if (currentPage < maxPage) {
      navigateToPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      navigateToPage(currentPage - 1);
    }
  };

  const handleSwipeLeft = () => {
    goToNextPage();
  };

  const handleSwipeRight = () => {
    goToPreviousPage();
  };

  const handleAudioToggle = async () => {
    try {
      if (isPlaying) {
        await pauseAudio();
      } else {
        // For Mushaf pages, we need to map page to specific ayahs
        // This is a simplified implementation - you would need proper page-to-ayah mapping
        Alert.alert(
          "Audio Playback",
          "Audio for Mushaf pages requires page-to-ayah mapping. Would you like to play a sample recitation?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Play Sample",
              onPress: async () => {
                try {
                  // Get available reciters from DataService
                  const reciters = dataService.getAvailableReciters();
                  console.log("Available reciters:", reciters);

                  // Try to get recitation for first ayah of first sura as example
                  const recitation = await dataService.getVerseRecitation(
                    1,
                    1,
                    "abdul-basit"
                  );
                  if (recitation) {
                    console.log("Found recitation:", recitation);
                    // Here you would play the audio using your audio context
                    Alert.alert(
                      "Success",
                      "Recitation data loaded successfully"
                    );
                  } else {
                    Alert.alert(
                      "Info",
                      "Recitation data not available for this ayah"
                    );
                  }
                } catch (error) {
                  console.error("Error loading recitation:", error);
                  Alert.alert("Error", "Failed to load recitation data");
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error handling audio:", error);
      Alert.alert("Error", "Failed to handle audio playback");
    }
  };

  const toggleBookmark = async () => {
    try {
      const isCurrentlyBookmarked = bookmarks.some(
        (b) => b.page === currentPage
      );
      let updatedBookmarks;

      if (isCurrentlyBookmarked) {
        // Remove bookmark
        updatedBookmarks = bookmarks.filter((b) => b.page !== currentPage);
        Alert.alert(
          "Bookmark Removed",
          `Page ${currentPage} removed from bookmarks`
        );
      } else {
        // Add bookmark
        const newBookmark = {
          id: Date.now(),
          page: currentPage,
          title: `Page ${currentPage}`,
          timestamp: new Date().toISOString(),
        };
        updatedBookmarks = [...bookmarks, newBookmark];
        Alert.alert("Bookmark Added", `Page ${currentPage} added to bookmarks`);
      }

      setBookmarks(updatedBookmarks);
      await dataService.saveBookmarks(updatedBookmarks);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      Alert.alert("Error", "Failed to save bookmark");
    }
  };

  const goToSura = (sura) => {
    // Basic sura-to-page mapping (this should be improved with actual data)
    const suraToPageMap = {
      1: 1, // Al-Fatihah
      2: 2, // Al-Baqarah
      3: 50, // Ali Imran
      4: 77, // An-Nisa
      5: 106, // Al-Ma'idah
      6: 128, // Al-An'am
      7: 151, // Al-A'raf
      8: 177, // Al-Anfal
      9: 187, // At-Tawbah
      10: 208, // Yunus
      11: 221, // Hud
      12: 235, // Yusuf
      13: 249, // Ar-Ra'd
      14: 255, // Ibrahim
      15: 262, // Al-Hijr
      16: 267, // An-Nahl
      17: 282, // Al-Isra
      18: 293, // Al-Kahf
      19: 305, // Maryam
      20: 312, // Ta-Ha
      21: 322, // Al-Anbiya
      22: 332, // Al-Hajj
      23: 342, // Al-Mu'minun
      24: 350, // An-Nur
      25: 359, // Al-Furqan
      26: 367, // Ash-Shu'ara
      27: 377, // An-Naml
      28: 385, // Al-Qasas
      29: 396, // Al-Ankabut
      30: 404, // Ar-Rum
    };

    const targetPage = suraToPageMap[sura.id] || 1;
    navigateToPage(targetPage);
    setShowSuraFilter(false);
  };

  const goToPara = (para) => {
    // Basic para-to-page mapping (30 paras across 610 pages)
    const paraToPageMap = {
      1: 1,
      2: 22,
      3: 42,
      4: 62,
      5: 82,
      6: 102,
      7: 122,
      8: 142,
      9: 162,
      10: 182,
      11: 202,
      12: 222,
      13: 242,
      14: 262,
      15: 282,
      16: 302,
      17: 322,
      18: 342,
      19: 362,
      20: 382,
      21: 402,
      22: 422,
      23: 442,
      24: 462,
      25: 482,
      26: 502,
      27: 522,
      28: 542,
      29: 562,
      30: 582,
    };

    const targetPage = paraToPageMap[para.id] || 1;
    navigateToPage(targetPage);
    setShowParaFilter(false);
  };

  const goToAyah = (suraId, ayahNumber) => {
    // This would need ayah-to-page mapping - for now just go to sura
    const sura = suraList.find((s) => s.id === suraId);
    if (sura) {
      goToSura(sura);
    }
    setShowAyahFilter(false);
  };

  const renderAyahModal = () => (
    <Modal
      visible={showAyahFilter}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAyahFilter(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.listModal, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Go to Ayah
            </Text>
            <TouchableOpacity onPress={() => setShowAyahFilter(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={{ padding: 20 }}>
            <Text
              style={[
                styles.filterText,
                { color: colors.text, marginBottom: 16 },
              ]}
            >
              This feature requires detailed ayah-to-page mapping data.
            </Text>
            <Text
              style={[
                styles.filterText,
                { color: colors.textSecondary, fontSize: 14 },
              ]}
            >
              For now, please use the Sura navigation to find specific ayahs.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );

  const goToBookmark = (bookmark) => {
    navigateToPage(bookmark.page);
    setShowBookmarks(false);
  };

  const handlePageInputSubmit = () => {
    const page = parseInt(pageInput);
    if (!isNaN(page)) {
      navigateToPage(page);
      setShowPageNavigator(false);
    }
  };

  const renderTopControls = () => {
    if (!showControls) return null;

    const isBookmarked = bookmarks.some((b) => b.page === currentPage);

    return (
      <>
        <View
          style={[
            styles.topControls,
            { backgroundColor: colors.surface + "E6" },
          ]}
        >
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowPageNavigator(true)}
            style={styles.pageButton}
          >
            <Text style={[styles.pageText, { color: colors.text }]}>
              Page {currentPage} / {totalPages}
            </Text>
          </TouchableOpacity>

          <View style={styles.topRightControls}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                {
                  backgroundColor: isBookmarked
                    ? colors.primary
                    : "transparent",
                },
              ]}
              onPress={toggleBookmark}
            >
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={20}
                color={isBookmarked ? "white" : colors.text}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setShowFilters(true)}
            >
              <Ionicons name="filter" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Navigation Controls */}
        <View
          style={[
            styles.bottomNavigation,
            { backgroundColor: colors.surface + "E6" },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.navButton,
              { opacity: currentPage <= minPage ? 0.3 : 1 },
            ]}
            onPress={goToPreviousPage}
            disabled={currentPage <= minPage}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
            <Text style={[styles.navButtonText, { color: colors.primary }]}>
              Previous
            </Text>
          </TouchableOpacity>

          <View style={styles.pageIndicatorContainer}>
            <TouchableOpacity
              style={[
                styles.currentPageButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => setShowPageNavigator(true)}
            >
              <Text style={[styles.currentPageText, { color: "white" }]}>
                {currentPage}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.navButton,
              { opacity: currentPage >= maxPage ? 0.3 : 1 },
            ]}
            onPress={goToNextPage}
            disabled={currentPage >= maxPage}
          >
            <Text style={[styles.navButtonText, { color: colors.primary }]}>
              Next
            </Text>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.filtersModal, { backgroundColor: colors.surface }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Navigation Filters
            </Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            <TouchableOpacity
              style={[styles.filterItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                setShowFilters(false);
                setShowPageNavigator(true);
              }}
            >
              <Ionicons name="document-text" size={24} color={colors.primary} />
              <Text style={[styles.filterText, { color: colors.text }]}>
                Go to Page
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                setShowFilters(false);
                setShowSuraFilter(true);
              }}
            >
              <Ionicons name="book" size={24} color={colors.primary} />
              <Text style={[styles.filterText, { color: colors.text }]}>
                Go to Sura
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                setShowFilters(false);
                setShowParaFilter(true);
              }}
            >
              <Ionicons name="library" size={24} color={colors.primary} />
              <Text style={[styles.filterText, { color: colors.text }]}>
                Go to Para
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                setShowFilters(false);
                setShowAyahFilter(true);
              }}
            >
              <Ionicons name="text" size={24} color={colors.primary} />
              <Text style={[styles.filterText, { color: colors.text }]}>
                Go to Ayah
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                setShowFilters(false);
                setShowBookmarks(true);
              }}
            >
              <Ionicons name="bookmarks" size={24} color={colors.primary} />
              <Text style={[styles.filterText, { color: colors.text }]}>
                Bookmarks
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderPageNavigator = () => (
    <Modal
      visible={showPageNavigator}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowPageNavigator(false)}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.navigatorModal, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Go to Page
          </Text>

          <TextInput
            style={[
              styles.pageInput,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={pageInput}
            onChangeText={setPageInput}
            placeholder={`Enter page number (${minPage}-${maxPage})`}
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            selectTextOnFocus={true}
            onSubmitEditing={handlePageInputSubmit}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: colors.background },
              ]}
              onPress={() => setShowPageNavigator(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handlePageInputSubmit}
            >
              <Text style={[styles.modalButtonText, { color: "white" }]}>
                Go
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderSuraFilter = () => (
    <Modal
      visible={showSuraFilter}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSuraFilter(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.listModal, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Sura
            </Text>
            <TouchableOpacity onPress={() => setShowSuraFilter(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={suraList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.listItem, { borderBottomColor: colors.border }]}
                onPress={() => goToSura(item)}
              >
                <View>
                  <Text style={[styles.listItemTitle, { color: colors.text }]}>
                    {item.id}. {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.listItemSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.nameArabic}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderParaFilter = () => (
    <Modal
      visible={showParaFilter}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowParaFilter(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.listModal, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Para (Juz)
            </Text>
            <TouchableOpacity onPress={() => setShowParaFilter(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={paraList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.listItem, { borderBottomColor: colors.border }]}
                onPress={() => goToPara(item)}
              >
                <Text style={[styles.listItemTitle, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderBookmarksModal = () => (
    <Modal
      visible={showBookmarks}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowBookmarks(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.listModal, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Bookmarks
            </Text>
            <TouchableOpacity onPress={() => setShowBookmarks(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {bookmarks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No bookmarks saved
              </Text>
            </View>
          ) : (
            <FlatList
              data={bookmarks}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => goToBookmark(item)}
                >
                  <View>
                    <Text
                      style={[styles.listItemTitle, { color: colors.text }]}
                    >
                      Page {item.page}
                    </Text>
                    <Text
                      style={[
                        styles.listItemSubtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {new Date(item.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        backgroundColor={colors.background}
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <TouchableOpacity
        activeOpacity={1}
        onPress={handleScreenPress}
        style={styles.readerContainer}
      >
        <MushafReader
          pageNumber={currentPage}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      </TouchableOpacity>

      {renderTopControls()}
      {renderFiltersModal()}
      {renderPageNavigator()}
      {renderSuraFilter()}
      {renderParaFilter()}
      {renderAyahModal()}
      {renderBookmarksModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  readerContainer: {
    flex: 1,
  },
  topControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Account for status bar
    zIndex: 1000,
  },
  controlButton: {
    padding: 8,
    borderRadius: 20,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  pageInfo: {
    flex: 1,
    alignItems: "center",
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pageText: {
    fontSize: 16,
    fontWeight: "600",
  },
  topRightControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Account for status bar
    zIndex: 1000,
  },
  controlButton: {
    padding: 8,
    borderRadius: 20,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  pageText: {
    fontSize: 16,
    fontWeight: "600",
  },
  topRightControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bottomNavigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 1000,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.1)",
    minWidth: 100,
    justifyContent: "center",
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 6,
  },
  pageIndicatorContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  currentPageButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  currentPageText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    zIndex: 1000,
  },
  navigationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
    justifyContent: "center",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  navigatorModal: {
    width: width * 0.8,
    maxWidth: 300,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  filtersModal: {
    width: width * 0.9,
    maxHeight: height * 0.6,
    borderRadius: 16,
    overflow: "hidden",
  },
  listModal: {
    width: width * 0.9,
    maxHeight: height * 0.7,
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  pageInput: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  filterContent: {
    maxHeight: height * 0.4,
  },
  filterItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  filterText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  listItemSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default MushafScreen;
