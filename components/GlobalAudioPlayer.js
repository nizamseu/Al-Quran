import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAudio } from "../contexts/AudioContext";
import { useTheme } from "../contexts/ThemeContext";
import { useFont } from "../contexts/FontContext";

const { width } = Dimensions.get("window");

const GlobalAudioPlayer = () => {
  const { colors } = useTheme();
  const { getTextStyle } = useFont();
  const {
    isPlaying,
    isLoading,
    currentTrack,
    position,
    duration,
    repeatMode,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    seekTo,
    changeRepeatMode,
    formatTime,
  } = useAudio();

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

  const handleRepeatPress = () => {
    const modes = ["none", "one", "all"];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    changeRepeatMode(nextMode);
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

  const progress = duration > 0 ? position / duration : 0;

  const styles = StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    progressBar: {
      height: 3,
      backgroundColor: colors.border,
      borderRadius: 1.5,
      marginBottom: 12,
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 1.5,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    trackInfo: {
      flex: 1,
      marginRight: 16,
    },
    trackTitle: {
      ...getTextStyle("subtitle", "medium"),
      color: colors.text,
      marginBottom: 2,
    },
    trackSubtitle: {
      ...getTextStyle("caption"),
      color: colors.textSecondary,
    },
    controls: {
      flexDirection: "row",
      alignItems: "center",
    },
    controlButton: {
      padding: 8,
      marginHorizontal: 4,
    },
    playButton: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      padding: 8,
      marginHorizontal: 8,
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 12,
    },
    timeText: {
      ...getTextStyle("caption"),
      color: colors.textSecondary,
      minWidth: 40,
      textAlign: "center",
    },
  });

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.content}>
        {/* Track Info */}
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {currentTrack.type === "sura"
              ? currentTrack.suraName
              : `${currentTrack.suraName} - Ayah ${currentTrack.ayahNumber}`}
          </Text>
          <Text style={styles.trackSubtitle} numberOfLines={1}>
            {currentTrack.reciter}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Repeat Button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleRepeatPress}
          >
            <Ionicons
              name={getRepeatIcon()}
              size={20}
              color={
                repeatMode !== "none" ? colors.primary : colors.textSecondary
              }
            />
          </TouchableOpacity>

          {/* Play/Pause Button */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPause}
            disabled={isLoading}
          >
            <Ionicons
              name={isLoading ? "hourglass" : isPlaying ? "pause" : "play"}
              size={20}
              color="white"
            />
          </TouchableOpacity>

          {/* Stop Button */}
          <TouchableOpacity style={styles.controlButton} onPress={stopPlayback}>
            <Ionicons name="stop" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Time Display */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            /
          </Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>
    </View>
  );
};

export default GlobalAudioPlayer;
