import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dataService from "../services/dataService";

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

const STORAGE_KEYS = {
  PRIMARY_TRANSLATION: "primary_translation",
  SECONDARY_TRANSLATION: "secondary_translation",
  TAFSIR_SOURCE: "tafsir_source",
  LANGUAGE_PREFERENCE: "language_preference",
  SHOW_TRANSLATION: "show_translation",
  SHOW_TAFSIR: "show_tafsir",
  SHOW_TRANSLITERATION: "show_transliteration",
  ARABIC_FONT_SIZE: "arabic_font_size",
  TRANSLATION_FONT_SIZE: "translation_font_size",
  TAFSIR_FONT_SIZE: "tafsir_font_size",
  READING_MODE: "reading_mode",
  AUTO_SCROLL: "auto_scroll",
  BOOKMARKS: "bookmarks",
  LAST_READ: "last_read",
  DAILY_VERSE_ENABLED: "daily_verse_enabled",
  NIGHT_MODE: "night_mode",
};

const defaultSettings = {
  primaryTranslation: { language: "en", translator: "qaribullah" },
  secondaryTranslation: { language: "bn", translator: "sheikh-mujibur-rahman" },
  tafsirSource: { language: "en", source: "abridged-explanation" },
  languagePreference: "en", // UI language
  showTranslation: true,
  showTafsir: false,
  showTransliteration: false,
  arabicFontSize: 20,
  translationFontSize: 16,
  tafsirFontSize: 14,
  readingMode: "single", // single, dual, verses-only
  autoScroll: false,
  bookmarks: [],
  lastRead: null,
  dailyVerseEnabled: true,
  nightMode: false,
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = { ...defaultSettings };

      for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
        const storedValue = await AsyncStorage.getItem(storageKey);
        if (storedValue !== null) {
          try {
            loadedSettings[key] = JSON.parse(storedValue);
          } catch {
            // If parsing fails, keep default value
          }
        }
      }

      setSettings(loadedSettings);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const storageKey = STORAGE_KEYS[key.toUpperCase()];
      if (storageKey) {
        await AsyncStorage.setItem(storageKey, JSON.stringify(value));
        setSettings((prev) => ({ ...prev, [key]: value }));
      }
    } catch (error) {
      console.error("Error saving setting:", error);
    }
  };

  const addBookmark = async (verseKey, suraId, ayahNumber) => {
    const bookmark = {
      id: `${verseKey}_${Date.now()}`,
      verseKey,
      suraId,
      ayahNumber,
      timestamp: Date.now(),
    };

    const newBookmarks = [bookmark, ...settings.bookmarks];
    await updateSetting("bookmarks", newBookmarks);
  };

  const removeBookmark = async (bookmarkId) => {
    const newBookmarks = settings.bookmarks.filter((b) => b.id !== bookmarkId);
    await updateSetting("bookmarks", newBookmarks);
  };

  const isBookmarked = (verseKey) => {
    return settings.bookmarks.some((b) => b.verseKey === verseKey);
  };

  const updateLastRead = async (suraId, ayahNumber) => {
    const lastRead = {
      suraId,
      ayahNumber,
      timestamp: Date.now(),
    };
    await updateSetting("lastRead", lastRead);
  };

  const getAvailableTranslators = (language) => {
    const translators = dataService.getTranslators(language);
    return translators.map((translator) => ({
      key: translator,
      name: dataService.getTranslatorName(language, translator),
    }));
  };

  const getAvailableTafsirSources = (language) => {
    const sources = dataService.getTafsirSources(language);
    return sources.map((source) => ({
      key: source,
      name: dataService.getTafsirName(language, source),
    }));
  };

  const resetSettings = async () => {
    try {
      // Clear all stored settings
      for (const storageKey of Object.values(STORAGE_KEYS)) {
        await AsyncStorage.removeItem(storageKey);
      }
      setSettings(defaultSettings);
    } catch (error) {
      console.error("Error resetting settings:", error);
    }
  };

  const exportSettings = async () => {
    try {
      return JSON.stringify(settings, null, 2);
    } catch (error) {
      console.error("Error exporting settings:", error);
      return null;
    }
  };

  const importSettings = async (settingsString) => {
    try {
      const importedSettings = JSON.parse(settingsString);
      const validatedSettings = { ...defaultSettings, ...importedSettings };

      // Save each setting
      for (const [key, value] of Object.entries(validatedSettings)) {
        await updateSetting(key, value);
      }

      return true;
    } catch (error) {
      console.error("Error importing settings:", error);
      return false;
    }
  };

  const getReadingProgress = () => {
    // Calculate today's reading progress
    const today = new Date().toDateString();
    const todayReading =
      settings.lastRead?.date === today ? settings.lastRead : null;

    return {
      todayVerses: todayReading?.versesRead || 0,
      currentStreak: calculateReadingStreak(),
      completionPercentage: calculateCompletionPercentage(),
      lastReadSura: settings.lastRead?.sura || null,
      lastReadVerse: settings.lastRead?.verse || null,
    };
  };

  const calculateReadingStreak = () => {
    // Simple implementation - would need more sophisticated tracking
    return settings.lastRead ? 1 : 0;
  };

  const calculateCompletionPercentage = () => {
    // Calculate percentage of Quran read based on bookmarks and last read
    const totalSuras = 114;
    const readSuras = settings.lastReadSuras?.length || 0;
    return Math.round((readSuras / totalSuras) * 100);
  };

  const value = {
    settings,
    loading,
    updateSetting,
    addBookmark,
    removeBookmark,
    isBookmarked,
    updateLastRead,
    getAvailableTranslators,
    getAvailableTafsirSources,
    getReadingProgress,
    resetSettings,
    exportSettings,
    importSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
