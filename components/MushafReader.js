import React, { useState, useEffect, useRef } from "react";
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
  Animated,
  Easing,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getMushafPage } from "../utils/mushafPages";

const { width, height } = Dimensions.get("window");

const MushafReader = ({ pageNumber, onSwipeLeft, onSwipeRight }) => {
  console.log(
    "MushafReader rendered with pageNumber:",
    pageNumber,
    "type:",
    typeof pageNumber
  );

  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [imageData, setImageData] = useState(null);
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log("MushafReader useEffect triggered, pageNumber:", pageNumber);
    loadPageData();
  }, [pageNumber]);

  const loadPageData = async () => {
    setLoading(true);
    try {
      console.log("Loading page:", pageNumber);
      const pageFile = getMushafPage(pageNumber);
      console.log("Page file result:", pageFile);
      console.log(
        "Page file has image?",
        pageFile && pageFile.image ? "YES" : "NO"
      );
      console.log("Page file image value:", pageFile?.image);

      if (pageFile && pageFile.image) {
        console.log("Setting image data for page:", pageNumber);
        setImageData(pageFile.image);
      } else {
        console.error("No page data found for page:", pageNumber);
        console.error("getMushafPage returned:", pageFile);
        Alert.alert("Error", `Page ${pageNumber} data not found`);
      }
    } catch (error) {
      console.error("Error loading page data:", error);
      Alert.alert("Error", "Failed to load page data");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced pan responder for smoother swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // More sensitive horizontal gesture detection
      return (
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
        Math.abs(gestureState.dx) > 5
      );
    },
    onPanResponderGrant: () => {
      // Reset animation values when gesture starts
      translateX.setOffset(translateX._value);
      translateX.setValue(0);
    },
    onPanResponderMove: (evt, gestureState) => {
      // Smooth follow movement with resistance at edges
      const { dx } = gestureState;
      const resistance = 0.7; // Add some resistance for better feel
      translateX.setValue(dx * resistance);

      // Optional: Add slight opacity change during swipe
      const opacityValue = Math.max(0.7, 1 - Math.abs(dx) / (width * 0.8));
      opacity.setValue(opacityValue);
    },
    onPanResponderRelease: (evt, gestureState) => {
      const { dx, vx } = gestureState;
      const threshold = width * 0.15; // Reduced threshold for easier swiping
      const velocityThreshold = 0.3;

      translateX.flattenOffset();

      // Check if swipe was fast enough or far enough
      const shouldSwipe =
        Math.abs(dx) > threshold || Math.abs(vx) > velocityThreshold;

      if (shouldSwipe) {
        // Animate to complete the swipe
        const toValue = dx > 0 ? width : -width;
        Animated.parallel([
          Animated.timing(translateX, {
            toValue,
            duration: 200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Execute swipe callback
          if (dx > 0) {
            onSwipeRight && onSwipeRight();
          } else {
            onSwipeLeft && onSwipeLeft();
          }

          // Reset animation values
          translateX.setValue(0);
          opacity.setValue(1);
        });
      } else {
        // Animate back to original position
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },
    onPanResponderTerminate: () => {
      // Reset if gesture is terminated
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
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
      <Animated.View
        style={[
          styles.pageContainer,
          {
            transform: [{ translateX }],
            opacity,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Hafizi Quran style border */}
        <View
          style={[styles.pageBorder, { borderColor: colors.primary + "30" }]}
        >
          <View
            style={[styles.innerBorder, { borderColor: colors.primary + "20" }]}
          >
            {imageData ? (
              <>
                <Text
                  style={{
                    color: colors.text,
                    textAlign: "center",
                    marginBottom: 10,
                  }}
                >
                  DEBUG: Showing image for page {pageNumber}
                </Text>
                <Image
                  source={imageData}
                  style={styles.pageImage}
                  resizeMode="contain"
                  onError={(error) => {
                    console.error(
                      "Image loading error:",
                      error.nativeEvent.error
                    );
                    Alert.alert(
                      "Error",
                      `Failed to load image for page ${pageNumber}`
                    );
                  }}
                  onLoad={() => {
                    console.log(
                      "Image loaded successfully for page:",
                      pageNumber
                    );
                  }}
                />
              </>
            ) : (
              <View style={styles.fallbackContainer}>
                <Text style={[styles.fallbackText, { color: colors.text }]}>
                  DEBUG: Page {pageNumber} image not available - imageData:{" "}
                  {JSON.stringify(imageData)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Enhanced touch areas for navigation */}
        <TouchableOpacity
          style={styles.leftTouchArea}
          onPress={onSwipeRight}
          activeOpacity={0}
        />
        <TouchableOpacity
          style={styles.rightTouchArea}
          onPress={onSwipeLeft}
          activeOpacity={0}
        />
      </Animated.View>
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
    padding: 12,
    position: "relative",
  },
  pageBorder: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: "#fefefe",
  },
  innerBorder: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 4,
    backgroundColor: "#fff",
  },
  pageImage: {
    width: width - 64,
    height: height - 160,
    maxWidth: "100%",
    maxHeight: "100%",
  },
  leftTouchArea: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "30%",
    backgroundColor: "transparent",
    zIndex: 10,
  },
  rightTouchArea: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "30%",
    backgroundColor: "transparent",
    zIndex: 10,
  },
  fallbackContainer: {
    width: width - 64,
    height: height - 160,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  fallbackText: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default MushafReader;
