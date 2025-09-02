import React, { createContext, useContext, useState, useMemo } from "react";
import dataService from "../services/dataService";

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    searchIn: "all", // all, sura-names, translations, tafsir
    language: "en",
    translator: null,
    revelationPlace: "all", // all, makkah, madinah
    minVerses: null,
    maxVerses: null,
  });

  // Search results based on query and filters
  const searchResults = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return { suras: [], verses: [] };

    const query = searchQuery.trim().toLowerCase();
    let results = { suras: [], verses: [] };

    // Search in sura names
    if (
      searchFilters.searchIn === "all" ||
      searchFilters.searchIn === "sura-names"
    ) {
      let suras = dataService.searchSuras(query);

      // Apply revelation place filter
      if (searchFilters.revelationPlace !== "all") {
        suras = suras.filter(
          (sura) => sura.revelationPlace === searchFilters.revelationPlace
        );
      }

      // Apply verse count filters
      if (searchFilters.minVerses) {
        suras = suras.filter(
          (sura) => sura.versesCount >= searchFilters.minVerses
        );
      }
      if (searchFilters.maxVerses) {
        suras = suras.filter(
          (sura) => sura.versesCount <= searchFilters.maxVerses
        );
      }

      results.suras = suras;
    }

    // Search in translations (this would be more complex in a real app)
    if (
      searchFilters.searchIn === "all" ||
      searchFilters.searchIn === "translations"
    ) {
      // For now, we'll just return empty array as searching all translations would be resource intensive
      // In a production app, you'd want to implement proper indexing
      results.verses = [];
    }

    return results;
  }, [searchQuery, searchFilters]);

  const addToSearchHistory = (query) => {
    if (!query.trim()) return;

    setSearchHistory((prev) => {
      const newHistory = [
        query.trim(),
        ...prev.filter((item) => item !== query.trim()),
      ];
      return newHistory.slice(0, 10); // Keep only last 10 searches
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  const removeFromSearchHistory = (query) => {
    setSearchHistory((prev) => prev.filter((item) => item !== query));
  };

  const updateSearchFilter = (key, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetSearchFilters = () => {
    setSearchFilters({
      searchIn: "all",
      language: "en",
      translator: null,
      revelationPlace: "all",
      minVerses: null,
      maxVerses: null,
    });
  };

  const getPopularSearches = () => {
    return [
      "Al-Fatiha",
      "Al-Baqarah",
      "Ayatul Kursi",
      "Al-Ikhlas",
      "An-Nas",
      "Al-Falaq",
      "Ar-Rahman",
      "Ya-Sin",
      "Al-Mulk",
      "Ad-Duha",
    ];
  };

  const getSuggestions = (query) => {
    if (!query.trim()) return [];

    const allSuras = dataService.getAllSuras();
    const queryLower = query.toLowerCase();

    return allSuras
      .filter(
        (sura) =>
          sura.name?.toLowerCase().startsWith(queryLower) ||
          sura.nameSimple?.toLowerCase().startsWith(queryLower) ||
          sura.nameBengali?.includes(query) ||
          sura.id?.toString().startsWith(query)
      )
      .slice(0, 5)
      .map((sura) => ({
        type: "sura",
        id: sura.id,
        title: sura.name,
        subtitle: sura.nameSimple,
        versesCount: sura.versesCount,
      }));
  };

  const performAdvancedSearch = async (searchOptions) => {
    // This would implement advanced search functionality
    // For now, we'll just return basic search results
    const { query, searchIn, languages, translators, includeArabic } =
      searchOptions;

    let results = {
      suras: [],
      verses: [],
      totalResults: 0,
    };

    if (searchIn.includes("sura-names")) {
      results.suras = dataService.searchSuras(query);
    }

    // Add verse search logic here in a production app

    results.totalResults = results.suras.length + results.verses.length;

    return results;
  };

  const value = {
    searchQuery,
    setSearchQuery,
    searchHistory,
    addToSearchHistory,
    clearSearchHistory,
    removeFromSearchHistory,
    searchFilters,
    updateSearchFilter,
    resetSearchFilters,
    searchResults,
    getPopularSearches,
    getSuggestions,
    performAdvancedSearch,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};
