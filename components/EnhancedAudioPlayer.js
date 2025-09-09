import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  Animated,
  PanGesturer,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// Note: Slider component removed to avoid dependency issues
// import Slider from "@react-native-community/slider";
import { useAudio } from "../contexts/AudioContext";
import { useTheme } from "../contexts/ThemeContext";
import { useFont } from "../contexts/FontContext";
import { useLanguage } from "../contexts/LanguageContext";
import dataService from "../services/dataService";

const { width, height } = Dimensions.get("window");

const EnhancedAudioPlayer = () => {
  const { colors, isDark } = useTheme();
  const { getTextStyle } = useFont();
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReciterSelector, setShowReciterSelector] = useState(false);
  const [availableReciters, setAvailableReciters] = useState([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showSpeedSelector, setShowSpeedSelector] = useState(false);
  const animationValue = useRef(new Animated.Value(0)).current;

  const {
    isPlaying,
    isLoading,
    currentTrack,
    position,
    duration,
    repeatMode,
    currentReciter,
    playbackMode,
    downloadedAudios,
    downloadProgress,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    seekTo,
    changeRepeatMode,
    changeReciter,
    changePlaybackMode,
    formatTime,
    downloadAudio,
    removeDownloadedAudio,
    playSura,
    playAyah,
  } = useAudio();

  useEffect(() => {
    loadAvailableReciters();
  }, []);

  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  const loadAvailableReciters = async () => {
    try {
      const recitersData = await dataService.getAvailableReciters();
      // Combine both ayah-by-ayah and sura-by-sura reciters into a single array
      const allReciters = [
        ...(recitersData["ayah-by-ayah"] || []),
        ...(recitersData["sura-by-sura"] || []),
      ];
      setAvailableReciters(allReciters);
    } catch (error) {
      console.error("Error loading reciters:", error);
      setAvailableReciters([]); // Ensure it's always an array
    }
  };

  if (!currentTrack) {
    return null;
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      pausePlayback();
    } else {
      resumePlayback();
    }
  };

  const handleStop = () => {
    stopPlayback();
    setIsExpanded(false);
  };

  const handleRepeatPress = () => {
    const modes = ["none", "one", "all"];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    changeRepeatMode(nextMode);
  };

  const handlePlaybackModePress = () => {
    const modes = ["sura", "ayah"];
    const newMode = playbackMode === "sura" ? "ayah" : "sura";
    changePlaybackMode(newMode);
  };

  const handleSeek = (value) => {
    const newPosition = value * duration;
    seekTo(newPosition);
  };

  const handleReciterChange = (reciter) => {
    changeReciter(reciter.id);
    setShowReciterSelector(false);

    // Restart current track with new reciter
    if (currentTrack) {
      if (currentTrack.type === "sura") {
        playSura(currentTrack.suraId, currentTrack.suraName);
      } else {
        playAyah(
          currentTrack.suraId,
          currentTrack.ayahNumber,
          currentTrack.suraName
        );
      }
    }
  };

  const handleDownloadToggle = async () => {
    try {
      const audioKey =
        currentTrack.type === "sura"
          ? `sura_${currentTrack.suraId}_${currentReciter}`
          : `ayah_${currentTrack.suraId}_${currentTrack.ayahNumber}_${currentReciter}`;

      if (downloadedAudios[audioKey]) {
        await removeDownloadedAudio(
          currentTrack.type,
          currentTrack.suraId,
          currentTrack.type === "ayah" ? currentTrack.ayahNumber : null,
          currentReciter
        );
        Alert.alert("Success", "Audio removed from downloads");
      } else {
        await downloadAudio(
          currentTrack.type,
          currentTrack.suraId,
          currentTrack.type === "ayah" ? currentTrack.ayahNumber : null,
          currentReciter
        );
        Alert.alert("Success", "Audio downloaded successfully");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to download/remove audio");
    }
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case "one":
        return "repeat-outline";
      case "all":
        return "repeat";
      default:
        return "repeat-outline";
    }
  };

  const isDownloaded = () => {
    const audioKey =
      currentTrack.type === "sura"
        ? `sura_${currentTrack.suraId}_${currentReciter}`
        : `ayah_${currentTrack.suraId}_${currentTrack.ayahNumber}_${currentReciter}`;
    return !!downloadedAudios[audioKey];
  };

  const getDownloadProgress = () => {
    const audioKey =
      currentTrack.type === "sura"
        ? `sura_${currentTrack.suraId}_${currentReciter}`
        : `ayah_${currentTrack.suraId}_${currentTrack.ayahNumber}_${currentReciter}`;
    return downloadProgress[audioKey] || 0;
  };

  const progress = duration > 0 ? position / duration : 0;

  const renderMiniPlayer = () => (
    <TouchableOpacity
      style={styles.miniPlayer}
      onPress={() => setIsExpanded(true)}
      activeOpacity={0.8}
    >
      {/* Progress Bar */}
      <View style={styles.miniProgressBar}>
        <View
          style={[styles.miniProgressFill, { width: `${progress * 100}%` }]}
        />
      </View>

      <View style={styles.miniContent}>
        {/* Track Info */}
        <View style={styles.miniTrackInfo}>
          <Text style={styles.miniTrackTitle} numberOfLines={1}>
            {currentTrack.type === "sura"
              ? currentTrack.suraName
              : `${currentTrack.suraName} - Ayah ${currentTrack.ayahNumber}`}
          </Text>
          <Text style={styles.miniTrackSubtitle} numberOfLines={1}>
            {currentReciter}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.miniControls}>
          <TouchableOpacity
            onPress={handlePlayPause}
            disabled={isLoading}
            style={styles.miniPlayButton}
          >
            <Ionicons
              name={isLoading ? "hourglass" : isPlaying ? "pause" : "play"}
              size={24}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleStop}
            style={styles.miniControlButton}
          >
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderExpandedPlayer = () => (
    <Modal
      visible={isExpanded}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View
        style={[
          styles.expandedContainer,
          { backgroundColor: colors.background },
        ]}
      >
        {/* Header */}
        <View style={styles.expandedHeader}>
          <TouchableOpacity
            onPress={() => setIsExpanded(false)}
            style={styles.headerButton}
          >
            <Ionicons name="chevron-down" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <TouchableOpacity
            onPress={() => setShowReciterSelector(true)}
            style={styles.headerButton}
          >
            <Ionicons name="person" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Track Art */}
        <View style={styles.trackArtContainer}>
          <View style={styles.trackArt}>
            <Ionicons name="musical-notes" size={80} color={colors.primary} />
          </View>
        </View>

        {/* Track Info */}
        <View style={styles.expandedTrackInfo}>
          <Text style={styles.expandedTrackTitle}>
            {currentTrack.type === "sura"
              ? currentTrack.suraName
              : `${currentTrack.suraName} - Ayah ${currentTrack.ayahNumber}`}
          </Text>
          <Text style={styles.expandedTrackSubtitle}>
            {(Array.isArray(availableReciters)
              ? availableReciters.find((r) => r.id === currentReciter)?.name
              : null) || currentReciter}
          </Text>
        </View>

        {/* Progress Slider - Replaced with TouchableOpacity for now */}
        <View style={styles.progressContainer}>
          <View style={styles.progressSliderContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Main Controls */}
        <View style={styles.mainControls}>
          <TouchableOpacity
            onPress={handleRepeatPress}
            style={styles.controlButton}
          >
            <Ionicons
              name={getRepeatIcon()}
              size={28}
              color={
                repeatMode !== "none" ? colors.primary : colors.textSecondary
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlayPause}
            disabled={isLoading}
            style={styles.mainPlayButton}
          >
            <Ionicons
              name={isLoading ? "hourglass" : isPlaying ? "pause" : "play"}
              size={32}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlaybackModePress}
            style={styles.controlButton}
          >
            <MaterialIcons
              name={playbackMode === "sura" ? "queue-music" : "music-note"}
              size={28}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Secondary Controls */}
        <View style={styles.secondaryControls}>
          <TouchableOpacity
            onPress={() => setShowSpeedSelector(true)}
            style={styles.secondaryButton}
          >
            <Text style={[styles.speedText, { color: colors.primary }]}>
              {playbackSpeed}x
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDownloadToggle}
            style={styles.secondaryButton}
          >
            {getDownloadProgress() > 0 && getDownloadProgress() < 1 ? (
              <View style={styles.downloadProgress}>
                <Text style={styles.progressText}>
                  {Math.round(getDownloadProgress() * 100)}%
                </Text>
              </View>
            ) : (
              <Ionicons
                name={isDownloaded() ? "cloud-done" : "cloud-download"}
                size={24}
                color={isDownloaded() ? colors.success : colors.primary}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleStop} style={styles.secondaryButton}>
            <Ionicons name="stop" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderReciterSelector = () => (
    <Modal
      visible={showReciterSelector}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Reciter</Text>
            <TouchableOpacity
              onPress={() => setShowReciterSelector(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={Array.isArray(availableReciters) ? availableReciters : []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.reciterItem,
                  currentReciter === item.id && styles.selectedReciterItem,
                ]}
                onPress={() => handleReciterChange(item)}
              >
                <Text
                  style={[
                    styles.reciterName,
                    currentReciter === item.id && styles.selectedReciterName,
                  ]}
                >
                  {item.name}
                </Text>
                {currentReciter === item.id && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const styles = StyleSheet.create({
    miniPlayer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    miniProgressBar: {
      height: 3,
      backgroundColor: colors.border,
    },
    miniProgressFill: {
      height: "100%",
      backgroundColor: colors.primary,
    },
    miniContent: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
    },
    miniTrackInfo: {
      flex: 1,
      marginRight: 12,
    },
    miniTrackTitle: {
      ...getTextStyle("subtitle", "medium"),
      color: colors.text,
      marginBottom: 2,
    },
    miniTrackSubtitle: {
      ...getTextStyle("caption"),
      color: colors.textSecondary,
    },
    miniControls: {
      flexDirection: "row",
      alignItems: "center",
    },
    miniPlayButton: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      padding: 8,
      marginRight: 8,
    },
    miniControlButton: {
      padding: 8,
    },
    expandedContainer: {
      flex: 1,
      paddingTop: 60,
    },
    expandedHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    headerButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      ...getTextStyle("title", "bold"),
      color: colors.text,
    },
    trackArtContainer: {
      alignItems: "center",
      marginVertical: 40,
    },
    trackArt: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    expandedTrackInfo: {
      alignItems: "center",
      paddingHorizontal: 40,
      marginBottom: 40,
    },
    expandedTrackTitle: {
      ...getTextStyle("title", "bold"),
      color: colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    expandedTrackSubtitle: {
      ...getTextStyle("body"),
      color: colors.textSecondary,
      textAlign: "center",
    },
    progressContainer: {
      paddingHorizontal: 40,
      marginBottom: 40,
    },
    progressSliderContainer: {
      width: "100%",
      height: 40,
      justifyContent: "center",
    },
    progressTrack: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    timeContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    timeText: {
      ...getTextStyle("caption"),
      color: colors.textSecondary,
    },
    mainControls: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 40,
      marginBottom: 30,
    },
    controlButton: {
      padding: 15,
      marginHorizontal: 20,
    },
    mainPlayButton: {
      backgroundColor: colors.primary,
      borderRadius: 35,
      padding: 20,
      marginHorizontal: 20,
    },
    secondaryControls: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 40,
    },
    secondaryButton: {
      padding: 12,
      marginHorizontal: 15,
      alignItems: "center",
      justifyContent: "center",
    },
    speedText: {
      ...getTextStyle("body", "bold"),
      fontSize: 16,
    },
    downloadProgress: {
      alignItems: "center",
    },
    progressText: {
      ...getTextStyle("caption"),
      color: colors.primary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: height * 0.7,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      ...getTextStyle("title", "bold"),
      color: colors.text,
    },
    modalCloseButton: {
      padding: 4,
    },
    reciterItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    selectedReciterItem: {
      backgroundColor: colors.primaryLight + "20",
    },
    reciterName: {
      ...getTextStyle("body"),
      color: colors.text,
    },
    selectedReciterName: {
      color: colors.primary,
      fontWeight: "600",
    },
  });

  return (
    <>
      {renderMiniPlayer()}
      {renderExpandedPlayer()}
      {renderReciterSelector()}
    </>
  );
};

export default EnhancedAudioPlayer;
