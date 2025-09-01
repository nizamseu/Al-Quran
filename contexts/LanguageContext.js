import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations } from "../translations";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("bn"); // Default to Bengali
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("app_language");

      if (savedLanguage) {
        setLanguage(savedLanguage);
      } else {
        // If no saved language, set Bengali as default and save it
        setLanguage("bn");
        await AsyncStorage.setItem("app_language", "bn");
      }
    } catch (error) {
      console.error("Error loading language:", error);
      // Fallback to Bengali on error
      setLanguage("bn");
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (newLanguage) => {
    try {
      await AsyncStorage.setItem("app_language", newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const t = (key) => {
    // Helper function to get nested object value by dot notation
    const getNestedValue = (obj, path) => {
      return path.split(".").reduce((current, segment) => {
        return current && current[segment] !== undefined
          ? current[segment]
          : null;
      }, obj);
    };

    // Try to get translation from current language
    let translation = getNestedValue(translations[language], key);

    // Fallback to Bengali if not found
    if (translation === null || translation === undefined) {
      translation = getNestedValue(translations.bn, key);
    }

    // If still not found, return the key itself
    return translation || key;
  };

  const value = {
    language,
    currentLanguage: language, // Add this for components that expect currentLanguage
    changeLanguage,
    t,
    isLoading,
    isRTL: language === "ar", // For future Arabic support
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
