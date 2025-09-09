import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";

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

  // Arabic Fonts
  indopakNastaleeq: {
    name: "Indopak Nastaleeq Font",
    fontFamily: "IndopakNastaleeq",
    bengaliSupport: false,
    arabicSupport: true,
    type: "arabic",
    fileName: "indopak_nastaleeq_font.ttf",
  },
  kfgqpcNastaleeq: {
    name: "KFGQPC Nastaleeq",
    fontFamily: "KFGQPCNastaleeq",
    bengaliSupport: false,
    arabicSupport: true,
    type: "arabic",
    fileName: "KFGQPCNastaleeq-Regular.ttf",
  },
  qpcHafs: {
    name: "QPC Hafs Font",
    fontFamily: "UthmanicHafs",
    bengaliSupport: false,
    arabicSupport: true,
    type: "arabic",
    fileName: "UthmanicHafs_V22.ttf",
  },
  qpcV1: {
    name: "QPC V1 Font",
    fontFamily: "DigitalKhatt",
    bengaliSupport: false,
    arabicSupport: true,
    type: "arabic",
    fileName: "DigitalKhattQuranic.otf",
  },
  qpcV2: {
    name: "QPC V2 Font",
    fontFamily: "DigitalKhattV2",
    bengaliSupport: false,
    arabicSupport: true,
    type: "arabic",
    fileName: "DigitalKhattV2.otf",
  },
  digitalKhattV2: {
    name: "Digital Khatt V2 Font",
    fontFamily: "DigitalKhattV2",
    bengaliSupport: false,
    arabicSupport: true,
    type: "arabic",
    fileName: "DigitalKhattV2.otf",
  },
  surahHeader: {
    name: "Surah Header Font",
    fontFamily: "QCFSurahHeader",
    bengaliSupport: false,
    arabicSupport: true,
    type: "arabic",
    fileName: "QCF_SurahHeader_COLOR-Regular.ttf",
  },
  meQuran: {
    name: "Me Quran Volt",
    fontFamily: "MeQuranVolt",
    bengaliSupport: false,
    arabicSupport: true,
    type: "arabic",
    fileName: "me_quran_volt_newmet.ttf",
  },

  // Bengali Fonts
  notoSansBengali: {
    name: "Noto Sans Bengali",
    fontFamily: "NotoSansBengali",
    bengaliSupport: true,
    arabicSupport: false,
    type: "bengali",
  },
  kalpurush: {
    name: "Kalpurush",
    fontFamily: "Kalpurush",
    bengaliSupport: true,
    arabicSupport: false,
    type: "bengali",
  },
  solaimanLipi: {
    name: "SolaimanLipi",
    fontFamily: "SolaimanLipi",
    bengaliSupport: true,
    arabicSupport: false,
    type: "bengali",
  },
  nikosh: {
    name: "Nikosh",
    fontFamily: "Nikosh",
    bengaliSupport: true,
    arabicSupport: false,
    type: "bengali",
  },

  // General Fonts
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
  const [arabicFontFamily, setArabicFontFamily] = useState("qpcHafs");
  const [bengaliFontFamily, setBengaliFontFamily] = useState("notoSansBengali");
  const [fontSize, setFontSize] = useState("medium");
  const [lineHeight, setLineHeight] = useState("normal");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFonts();
  }, []);

  const loadFonts = async () => {
    try {
      setIsLoading(true);

      // Load custom fonts
      await Font.loadAsync({
        IndopakNastaleeq: require("../assets/fonts/indopak_nastaleeq_font.ttf"),
        KFGQPCNastaleeq: require("../assets/fonts/KFGQPCNastaleeq-Regular.ttf"),
        UthmanicHafs: require("../assets/fonts/UthmanicHafs_V22.ttf"),
        DigitalKhatt: require("../assets/fonts/DigitalKhattQuranic.otf"),
        DigitalKhattV2: require("../assets/fonts/DigitalKhattV2.otf"),
        QCFSurahHeader: require("../assets/fonts/QCF_SurahHeader_COLOR-Regular.ttf"),
        MeQuranVolt: require("../assets/fonts/me_quran_volt_newmet.ttf"),
      });

      // Load font preferences after fonts are loaded
      await loadFontPreferences();
    } catch (error) {
      console.error("Error loading fonts:", error);
      // Load preferences anyway to avoid blocking the app
      await loadFontPreferences();
    }
  };

  const loadFontPreferences = async () => {
    try {
      const [
        savedFontFamily,
        savedArabicFont,
        savedBengaliFont,
        savedFontSize,
        savedLineHeight,
      ] = await Promise.all([
        AsyncStorage.getItem("app_font_family"),
        AsyncStorage.getItem("app_arabic_font_family"),
        AsyncStorage.getItem("app_bengali_font_family"),
        AsyncStorage.getItem("app_font_size"),
        AsyncStorage.getItem("app_line_height"),
      ]);

      if (savedFontFamily && fontFamilies[savedFontFamily]) {
        setFontFamily(savedFontFamily);
      }
      if (savedArabicFont && fontFamilies[savedArabicFont]) {
        setArabicFontFamily(savedArabicFont);
      }
      if (savedBengaliFont && fontFamilies[savedBengaliFont]) {
        setBengaliFontFamily(savedBengaliFont);
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

  const changeArabicFontFamily = async (newFamily) => {
    if (fontFamilies[newFamily] && fontFamilies[newFamily].arabicSupport) {
      try {
        await AsyncStorage.setItem("app_arabic_font_family", newFamily);
        setArabicFontFamily(newFamily);
      } catch (error) {
        console.error("Error saving Arabic font family:", error);
      }
    }
  };

  const changeBengaliFontFamily = async (newFamily) => {
    if (fontFamilies[newFamily] && fontFamilies[newFamily].bengaliSupport) {
      try {
        await AsyncStorage.setItem("app_bengali_font_family", newFamily);
        setBengaliFontFamily(newFamily);
      } catch (error) {
        console.error("Error saving Bengali font family:", error);
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
    const currentArabicFont = fontFamilies[arabicFontFamily];
    const currentFontSize = fontSizes[fontSize];
    const currentLineHeight = lineHeights[lineHeight];

    const baseSize =
      customSize || currentFontSize.sizes.arabic || currentFontSize.sizes.body;

    return {
      fontFamily:
        currentArabicFont.fontFamily === "System"
          ? undefined
          : currentArabicFont.fontFamily,
      fontSize: baseSize,
      fontWeight: fontWeights[weight] || fontWeights.normal,
      lineHeight: baseSize * currentLineHeight,
      textAlign: "right",
      writingDirection: "rtl",
    };
  };

  // Helper function for Bengali text styling
  const getBengaliTextStyle = (weight = "normal", customSize = null) => {
    const currentBengaliFont = fontFamilies[bengaliFontFamily];
    const currentFontSize = fontSizes[fontSize];
    const currentLineHeight = lineHeights[lineHeight];

    const baseSize =
      customSize || currentFontSize.sizes.bengali || currentFontSize.sizes.body;

    return {
      fontFamily:
        currentBengaliFont.fontFamily === "System"
          ? undefined
          : currentBengaliFont.fontFamily,
      fontSize: baseSize,
      fontWeight: fontWeights[weight] || fontWeights.normal,
      lineHeight: baseSize * currentLineHeight,
    };
  };

  // Helper to get fonts by type
  const getArabicFonts = () => {
    return Object.keys(fontFamilies).filter(
      (key) =>
        fontFamilies[key].arabicSupport || fontFamilies[key].type === "arabic"
    );
  };

  const getBengaliFonts = () => {
    return Object.keys(fontFamilies).filter(
      (key) =>
        fontFamilies[key].bengaliSupport || fontFamilies[key].type === "bengali"
    );
  };

  const value = {
    // Current settings
    fontFamily,
    arabicFontFamily,
    bengaliFontFamily,
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
    changeArabicFontFamily,
    changeBengaliFontFamily,
    changeFontSize,
    changeLineHeight,

    // Style helpers
    getTextStyle,
    getArabicTextStyle,
    getBengaliTextStyle,
    getArabicFonts,
    getBengaliFonts,

    // Current font info
    currentFontFamily: fontFamilies[fontFamily],
    currentArabicFont: fontFamilies[arabicFontFamily],
    currentBengaliFont: fontFamilies[bengaliFontFamily],
    currentFontSize: fontSizes[fontSize],
    currentLineHeight: lineHeights[lineHeight],
  };

  return <FontContext.Provider value={value}>{children}</FontContext.Provider>;
};
