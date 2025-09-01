import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FontContext = createContext();

export const useFont = () => {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error("useFont must be used within a FontProvider");
  }
  return context;
};

// Font configurations
const fontFamilies = {
  default: {
    name: "System Default",
    fontFamily: "System",
    bengaliSupport: true,
    arabicSupport: true,
  },
  roboto: {
    name: "Roboto",
    fontFamily: "Roboto",
    bengaliSupport: false,
    arabicSupport: false,
  },
  openSans: {
    name: "Open Sans",
    fontFamily: "OpenSans",
    bengaliSupport: false,
    arabicSupport: false,
  },
  notoSans: {
    name: "Noto Sans",
    fontFamily: "NotoSans",
    bengaliSupport: true,
    arabicSupport: true,
  },
  lato: {
    name: "Lato",
    fontFamily: "Lato",
    bengaliSupport: false,
    arabicSupport: false,
  },
};

const fontSizes = {
  extraSmall: {
    name: "Extra Small",
    scale: 0.85,
    sizes: {
      caption: 10,
      body: 12,
      subtitle: 14,
      title: 16,
      heading: 18,
      display: 20,
      arabic: 16,
      bengali: 14,
    },
  },
  small: {
    name: "Small",
    scale: 0.9,
    sizes: {
      caption: 11,
      body: 13,
      subtitle: 15,
      title: 17,
      heading: 19,
      display: 21,
      arabic: 17,
      bengali: 15,
    },
  },
  medium: {
    name: "Medium",
    scale: 1.0,
    sizes: {
      caption: 12,
      body: 14,
      subtitle: 16,
      title: 18,
      heading: 20,
      display: 24,
      arabic: 18,
      bengali: 16,
    },
  },
  large: {
    name: "Large",
    scale: 1.1,
    sizes: {
      caption: 13,
      body: 15,
      subtitle: 17,
      title: 19,
      heading: 22,
      display: 26,
      arabic: 20,
      bengali: 18,
    },
  },
  extraLarge: {
    name: "Extra Large",
    scale: 1.2,
    sizes: {
      caption: 14,
      body: 16,
      subtitle: 18,
      title: 21,
      heading: 24,
      display: 28,
      arabic: 22,
      bengali: 20,
    },
  },
};

// Font weight configurations
const fontWeights = {
  light: "300",
  normal: "400",
  medium: "500",
  semiBold: "600",
  bold: "700",
};

// Line height multipliers
const lineHeights = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
};

export const FontProvider = ({ children }) => {
  const [fontFamily, setFontFamily] = useState("default");
  const [fontSize, setFontSize] = useState("medium");
  const [lineHeight, setLineHeight] = useState("normal");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFontPreferences();
  }, []);

  const loadFontPreferences = async () => {
    try {
      const [savedFontFamily, savedFontSize, savedLineHeight] =
        await Promise.all([
          AsyncStorage.getItem("app_font_family"),
          AsyncStorage.getItem("app_font_size"),
          AsyncStorage.getItem("app_line_height"),
        ]);

      if (savedFontFamily && fontFamilies[savedFontFamily]) {
        setFontFamily(savedFontFamily);
      }
      if (savedFontSize && fontSizes[savedFontSize]) {
        setFontSize(savedFontSize);
      }
      if (savedLineHeight && lineHeights[savedLineHeight]) {
        setLineHeight(savedLineHeight);
      }
    } catch (error) {
      console.error("Error loading font preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeFontFamily = async (newFamily) => {
    if (fontFamilies[newFamily]) {
      try {
        await AsyncStorage.setItem("app_font_family", newFamily);
        setFontFamily(newFamily);
      } catch (error) {
        console.error("Error saving font family:", error);
      }
    }
  };

  const changeFontSize = async (newSize) => {
    if (fontSizes[newSize]) {
      try {
        await AsyncStorage.setItem("app_font_size", newSize);
        setFontSize(newSize);
      } catch (error) {
        console.error("Error saving font size:", error);
      }
    }
  };

  const changeLineHeight = async (newLineHeight) => {
    if (lineHeights[newLineHeight]) {
      try {
        await AsyncStorage.setItem("app_line_height", newLineHeight);
        setLineHeight(newLineHeight);
      } catch (error) {
        console.error("Error saving line height:", error);
      }
    }
  };

  // Helper function to get font styles
  const getTextStyle = (
    type = "body",
    weight = "normal",
    customSize = null
  ) => {
    const currentFontFamily = fontFamilies[fontFamily];
    const currentFontSize = fontSizes[fontSize];
    const currentLineHeight = lineHeights[lineHeight];

    const baseSize =
      customSize || currentFontSize.sizes[type] || currentFontSize.sizes.body;

    return {
      fontFamily:
        currentFontFamily.fontFamily === "System"
          ? undefined
          : currentFontFamily.fontFamily,
      fontSize: baseSize,
      fontWeight: fontWeights[weight] || fontWeights.normal,
      lineHeight: baseSize * currentLineHeight,
    };
  };

  // Helper function for Arabic text styling
  const getArabicTextStyle = (weight = "normal", customSize = null) => {
    return {
      ...getTextStyle("arabic", weight, customSize),
      textAlign: "right",
      writingDirection: "rtl",
    };
  };

  // Helper function for Bengali text styling
  const getBengaliTextStyle = (weight = "normal", customSize = null) => {
    return {
      ...getTextStyle("bengali", weight, customSize),
    };
  };

  const value = {
    // Current settings
    fontFamily,
    fontSize,
    lineHeight,
    isLoading,

    // Available options
    fontFamilies,
    fontSizes,
    lineHeights,
    fontWeights,

    // Change functions
    changeFontFamily,
    changeFontSize,
    changeLineHeight,

    // Style helpers
    getTextStyle,
    getArabicTextStyle,
    getBengaliTextStyle,

    // Current font info
    currentFontFamily: fontFamilies[fontFamily],
    currentFontSize: fontSizes[fontSize],
    currentLineHeight: lineHeights[lineHeight],
  };

  return <FontContext.Provider value={value}>{children}</FontContext.Provider>;
};
