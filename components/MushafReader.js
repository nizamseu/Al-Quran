import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text,
  PanResponder,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getMushafPage } from "../utils/mushafPages";

const { width, height } = Dimensions.get("window");

const MushafReader = ({ pageNumber, onSwipeLeft, onSwipeRight }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    loadPageData();
  }, [pageNumber]);

  const loadPageData = async () => {
    setLoading(true);
    try {
      const pageFile = getMushafPage(pageNumber);
      setImageData(pageFile.image);
    } catch (error) {
      console.error("Error loading page data:", error);
      Alert.alert("Error", "Failed to load page data");
    } finally {
      setLoading(false);
    }
  };

  // Simple pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to horizontal gestures
      return (
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
        Math.abs(gestureState.dx) > 10
      );
    },
    onPanResponderMove: (evt, gestureState) => {
      // Optional: Add visual feedback during swipe
    },
    onPanResponderRelease: (evt, gestureState) => {
      const { dx } = gestureState;
      const threshold = width * 0.25; // 25% of screen width

      if (Math.abs(dx) > threshold) {
        if (dx > 0) {
          // Swipe right - go to previous page
          onSwipeRight && onSwipeRight();
        } else {
          // Swipe left - go to next page
          onSwipeLeft && onSwipeLeft();
        }
      }
    },
  });

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading page {pageNumber}...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.pageContainer} {...panResponder.panHandlers}>
        {imageData && (
          <Image
            source={imageData}
            style={styles.pageImage}
            resizeMode="contain"
          />
        )}

        {/* Invisible touch areas for navigation - fallback for touch */}
        <TouchableOpacity
          style={styles.leftTouchArea}
          onPress={onSwipeRight}
          activeOpacity={0.1}
        />
        <TouchableOpacity
          style={styles.rightTouchArea}
          onPress={onSwipeLeft}
          activeOpacity={0.1}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  pageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    position: "relative",
  },
  pageImage: {
    width: width - 32,
    height: height - 120,
    maxWidth: "100%",
    maxHeight: "100%",
  },
  leftTouchArea: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "25%",
    backgroundColor: "transparent",
  },
  rightTouchArea: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "25%",
    backgroundColor: "transparent",
  },
});

export default MushafReader;
