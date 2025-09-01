import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Theme configurations
const lightTheme = {
  mode: "light",
  colors: {
    primary: "#059669",
    primaryLight: "#10b981",
    primaryDark: "#047857",
    secondary: "#8b5cf6",
    background: "#f9fafb",
    surface: "#ffffff",
    surfaceSecondary: "#f3f4f6",
    text: "#1f2937",
    textSecondary: "#6b7280",
    textTertiary: "#9ca3af",
    border: "#e5e7eb",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
    gradient: {
      primary: ["#059669", "#10b981"],
      secondary: ["#8b5cf6", "#a855f7"],
      tertiary: ["#3b82f6", "#6366f1"],
    },
  },
  shadows: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

const darkTheme = {
  mode: "dark",
  colors: {
    primary: "#10b981",
    primaryLight: "#34d399",
    primaryDark: "#059669",
    secondary: "#a855f7",
    background: "#111827",
    surface: "#1f2937",
    surfaceSecondary: "#374151",
    text: "#f9fafb",
    textSecondary: "#d1d5db",
    textTertiary: "#9ca3af",
    border: "#374151",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#60a5fa",
    gradient: {
      primary: ["#10b981", "#34d399"],
      secondary: ["#a855f7", "#c084fc"],
      tertiary: ["#60a5fa", "#818cf8"],
    },
  },
  shadows: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState("system"); // 'light', 'dark', 'system'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("app_theme");
      if (savedTheme) {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeTheme = async (newTheme) => {
    try {
      await AsyncStorage.setItem("app_theme", newTheme);
      setThemeMode(newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  // Determine current theme based on mode
  const getCurrentTheme = () => {
    if (themeMode === "system") {
      return systemColorScheme === "dark" ? darkTheme : lightTheme;
    }
    return themeMode === "dark" ? darkTheme : lightTheme;
  };

  const currentTheme = getCurrentTheme();
  const isDark = currentTheme.mode === "dark";

  const value = {
    theme: currentTheme,
    themeMode,
    changeTheme,
    isDark,
    isLoading,
    colors: currentTheme.colors,
    shadows: currentTheme.shadows,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
