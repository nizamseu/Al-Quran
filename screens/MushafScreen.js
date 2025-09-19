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
import { useRouter } from "expo-router";
import { useTheme } from "../contexts/ThemeContext";
import { useFont } from "../contexts/FontContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useAudio } from "../contexts/AudioContext";
import MushafReader from "../components/MushafReader";
import dataService from "../services/dataService";
import { getTotalPages, getPageRange } from "../utils/mushafPages";

const { width, height } = Dimensions.get("window");

const MushafScreen = ({ route }) => {
  const { pageNumber: initialPage = 1 } = route?.params || {};

  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { getTextStyle } = useFont();
  const { t, currentLanguage } = useLanguage();
  const { playAyah, isPlaying, pauseAudio, resumeAudio } = useAudio();

  const [currentPage, setCurrentPage] = useState(initialPage);
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
    if (isPlaying) {
      await pauseAudio();
    } else {
      Alert.alert(
        "Audio",
        "Please implement page-to-ayah mapping for audio playback"
      );
    }
  };

  const handlePageInputSubmit = () => {
    const page = parseInt(pageInput);
    if (!isNaN(page)) {
      navigateToPage(page);
      setShowPageNavigator(false);
    }
  };

  const toggleBookmark = async () => {
    try {
      const isBookmarked = bookmarks.some((b) => b.page === currentPage);

      if (isBookmarked) {
        const updatedBookmarks = bookmarks.filter(
          (b) => b.page !== currentPage
        );
        await dataService.saveBookmarks(updatedBookmarks);
        setBookmarks(updatedBookmarks);
      } else {
        const newBookmark = {
          page: currentPage,
          timestamp: new Date().toISOString(),
          note: `Page ${currentPage}`,
        };
        const updatedBookmarks = [...bookmarks, newBookmark];
        await dataService.saveBookmarks(updatedBookmarks);
        setBookmarks(updatedBookmarks);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const goToBookmark = (bookmark) => {
    navigateToPage(bookmark.page);
    setShowBookmarks(false);
  };

  const goToSura = (sura) => {
    // This would need sura-to-page mapping from your data
    Alert.alert(
      "Navigate to Sura",
      `Navigate to ${sura.name} - Page mapping needed`
    );
    setShowSuraFilter(false);
  };

  const goToPara = (para) => {
    // This would need para-to-page mapping from your data
    Alert.alert(
      "Navigate to Para",
      `Navigate to ${para.name} - Page mapping needed`
    );
    setShowParaFilter(false);
  };

  const renderTopControls = () => {
    if (!showControls) return null;

    const isBookmarked = bookmarks.some((b) => b.page === currentPage);

    return (
      <View
        style={[styles.topControls, { backgroundColor: colors.surface + "E6" }]}
      >
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.pageInfo}>
          <TouchableOpacity
            onPress={() => setShowPageNavigator(true)}
            style={styles.pageButton}
          >
            <Text style={[styles.pageText, { color: colors.text }]}>
              Page {currentPage} / {totalPages}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.topRightControls}>
          {/* Audio Toggle Button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              { backgroundColor: isPlaying ? colors.primary : "transparent" },
            ]}
            onPress={handleAudioToggle}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={20}
              color={isPlaying ? "white" : colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              {
                backgroundColor: isBookmarked ? colors.primary : "transparent",
              },
            ]}
            onPress={toggleBookmark}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={24}
              color={isBookmarked ? "white" : colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBottomControls = () => {
    if (!showControls) return null;

    return (
      <View
        style={[
          styles.bottomControls,
          { backgroundColor: colors.surface + "E6" },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.navigationButton,
            { opacity: currentPage <= 1 ? 0.5 : 1 },
          ]}
          onPress={goToPreviousPage}
          disabled={currentPage <= 1}
        >
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
          <Text style={[styles.navButtonText, { color: colors.primary }]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navigationButton,
            { opacity: currentPage >= maxPage ? 0.5 : 1 },
          ]}
          onPress={goToNextPage}
          disabled={currentPage >= maxPage}
        >
          <Text style={[styles.navButtonText, { color: colors.primary }]}>
            Next
          </Text>
          <Ionicons name="chevron-forward" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>
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
      {renderBottomControls()}
      {renderFiltersModal()}
      {renderPageNavigator()}
      {renderSuraFilter()}
      {renderParaFilter()}
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
