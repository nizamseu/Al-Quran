import suraNames from "../assets/data/quran-metadata/quran-metadata-surah-name.json";
import ayahData from "../assets/data/quran-metadata/quran-metadata-ayah.json";

// Import translation files
import enQaribullah from "../assets/data/translations/en/en-qaribullah-simple.json";
import enWahiduddin from "../assets/data/translations/en/en-maulana-wahiduddin-khan-with-footnote-tags.json";
import enWbwTransliteration from "../assets/data/translations/en/english-wbw-transliteration.json";

import bnSheikhMujibur from "../assets/data/translations/bn/bn-sheikh-mujibur-rahman-simple.json";
import bnTaisirul from "../assets/data/translations/bn/bn-taisirul-quran-simple.json";
import bnRawai from "../assets/data/translations/bn/bn-rawai-al-bayan-simple.json";
import bnZakaria from "../assets/data/translations/bn/dr-abu-bakr-muhammad-zakaria-simple.json";
import bnWbw from "../assets/data/translations/bn/bangali-word-by-word-translation.json";

// Import tafsir files
import enAbridged from "../assets/data/tafsir/en/abridged-explanation-of-the-quran.json";
import enMaarifQuran from "../assets/data/tafsir/en/en-tafsir-maarif-ul-quran.json";
import enTazkirulQuran from "../assets/data/tafsir/en/tazkirul-quran-en.json";

import bnMokhtasar from "../assets/data/tafsir/bn/bengali-mokhtasar.json";
import bnIbnKaseer from "../assets/data/tafsir/bn/bn-tafseer-ibn-e-kaseer.json";
import bnZakariaAbuBakr from "../assets/data/tafsir/bn/bn-tafsir-abu-bakr-zakaria.json";
import bnFathulMajid from "../assets/data/tafsir/bn/tafisr-fathul-majid-bn.json";

// Import recitation files (these might be large, so we'll handle them separately)
// import abdulBasitRecitation from '../assets/data/recitation/ayah-by-ayah/ayah-recitation-abdul-basit-abdul-samad-mujawwad-hafs.json';
// import yasserRecitation from '../assets/data/recitation/ayah-by-ayah/ayah-recitation-yasser-al-dosari-murattal-hafs.json';

class DataService {
  constructor() {
    this.translations = {
      en: {
        qaribullah: enQaribullah,
        "wahiduddin-khan": enWahiduddin,
        "wbw-transliteration": enWbwTransliteration,
      },
      bn: {
        "sheikh-mujibur-rahman": bnSheikhMujibur,
        "taisirul-quran": bnTaisirul,
        "rawai-al-bayan": bnRawai,
        "abu-bakr-zakaria": bnZakaria,
        "wbw-translation": bnWbw,
      },
    };

    this.tafsir = {
      en: {
        "abridged-explanation": enAbridged,
        "maarif-ul-quran": enMaarifQuran,
        "tazkirul-quran": enTazkirulQuran,
      },
      bn: {
        "bengali-mokhtasar": bnMokhtasar,
        "ibn-kaseer": bnIbnKaseer,
        "abu-bakr-zakaria": bnZakariaAbuBakr,
        "fathul-majid": bnFathulMajid,
      },
    };

    // Translation names for UI
    this.translationNames = {
      en: {
        qaribullah: "Qaribullah & Darwish",
        "wahiduddin-khan": "Maulana Wahiduddin Khan",
        "wbw-transliteration": "Word by Word Transliteration",
      },
      bn: {
        "sheikh-mujibur-rahman": "Sheikh Mujibur Rahman",
        "taisirul-quran": "Taisirul Quran",
        "rawai-al-bayan": "Rawai Al Bayan",
        "abu-bakr-zakaria": "Dr. Abu Bakr Muhammad Zakaria",
        "wbw-translation": "Bangla Word by Word",
      },
    };

    this.tafsirNames = {
      en: {
        "abridged-explanation": "Abridged Explanation of the Quran",
        "maarif-ul-quran": "Maarif-ul-Quran",
        "tazkirul-quran": "Tazkirul Quran",
      },
      bn: {
        "bengali-mokhtasar": "Bengali Mokhtasar",
        "ibn-kaseer": "Tafseer Ibn Katheer",
        "abu-bakr-zakaria": "Abu Bakr Zakaria",
        "fathul-majid": "Tafsir Fathul Majid",
      },
    };
  }

  // Get all suras with metadata
  getAllSuras() {
    return Object.values(suraNames).map((sura) => ({
      id: sura.id,
      name: sura.name,
      nameSimple: sura.name_simple,
      nameArabic: sura.name_arabic,
      nameBengali: sura.name_bengali,
      versesCount: sura.verses_count,
      revelationOrder: sura.revelation_order,
      revelationPlace: sura.revelation_place,
      bismillahPre: sura.bismillah_pre,
    }));
  }

  // Get sura by ID
  getSuraById(id) {
    const suraData = suraNames[id.toString()];
    if (!suraData) return null;

    return {
      id: suraData.id,
      name: suraData.name,
      nameSimple: suraData.name_simple,
      nameArabic: suraData.name_arabic,
      nameBengali: suraData.name_bengali,
      versesCount: suraData.verses_count,
      revelationOrder: suraData.revelation_order,
      revelationPlace: suraData.revelation_place,
      bismillahPre: suraData.bismillah_pre,
    };
  }

  // Get verses for a sura
  getVersesForSura(suraId) {
    const verses = [];

    // Filter ayah data for the specific sura
    Object.values(ayahData).forEach((ayah) => {
      if (ayah.surah_number === parseInt(suraId)) {
        verses.push({
          id: ayah.id,
          ayahNumber: ayah.ayah_number,
          verseKey: ayah.verse_key,
          wordsCount: ayah.words_count,
          text: ayah.text,
        });
      }
    });

    return verses.sort((a, b) => a.ayahNumber - b.ayahNumber);
  }

  // Get translation for a specific verse
  getTranslation(
    suraIdOrVerseKey,
    verseNumberOrLanguage,
    translatorIdOrTranslator
  ) {
    // Handle two calling patterns:
    // 1. getTranslation(verseKey, language, translator) - original
    // 2. getTranslation(suraId, verseNumber, translatorId) - new pattern

    let verseKey, language, translator;

    if (
      typeof suraIdOrVerseKey === "string" &&
      suraIdOrVerseKey.includes(":")
    ) {
      // Pattern 1: verseKey format like "1:1"
      verseKey = suraIdOrVerseKey;
      language = verseNumberOrLanguage;
      translator = translatorIdOrTranslator;
    } else {
      // Pattern 2: separate suraId and verseNumber
      const suraId = suraIdOrVerseKey;
      const verseNumber = verseNumberOrLanguage;
      const translatorId = translatorIdOrTranslator;
      verseKey = `${suraId}:${verseNumber}`;

      // Determine language from translator ID
      if (this.translations.en && this.translations.en[translatorId]) {
        language = "en";
        translator = translatorId;
      } else if (this.translations.bn && this.translations.bn[translatorId]) {
        language = "bn";
        translator = translatorId;
      } else {
        return null;
      }
    }

    const translationData = this.translations[language]?.[translator];
    if (!translationData) return null;

    const translation = translationData[verseKey];
    return translation ? translation.t : null;
  }

  // Get tafsir for a specific verse
  getTafsir(suraIdOrVerseKey, verseNumberOrLanguage, tafsirSourceOrSource) {
    // Handle two calling patterns:
    // 1. getTafsir(verseKey, language, tafsirSource) - original
    // 2. getTafsir(suraId, verseNumber, tafsirSourceId) - new pattern

    let verseKey, language, tafsirSource;

    if (
      typeof suraIdOrVerseKey === "string" &&
      suraIdOrVerseKey.includes(":")
    ) {
      // Pattern 1: verseKey format like "1:1"
      verseKey = suraIdOrVerseKey;
      language = verseNumberOrLanguage;
      tafsirSource = tafsirSourceOrSource;
    } else {
      // Pattern 2: separate suraId and verseNumber
      const suraId = suraIdOrVerseKey;
      const verseNumber = verseNumberOrLanguage;
      const tafsirSourceId = tafsirSourceOrSource;
      verseKey = `${suraId}:${verseNumber}`;

      // Determine language from tafsir source ID
      if (this.tafsir.en && this.tafsir.en[tafsirSourceId]) {
        language = "en";
        tafsirSource = tafsirSourceId;
      } else if (this.tafsir.bn && this.tafsir.bn[tafsirSourceId]) {
        language = "bn";
        tafsirSource = tafsirSourceId;
      } else {
        return null;
      }
    }

    const tafsirData = this.tafsir[language]?.[tafsirSource];
    if (!tafsirData) return null;

    const tafsir = tafsirData[verseKey];
    // Handle both 't' and 'text' properties (different tafsir files use different formats)
    return tafsir ? tafsir.t || tafsir.text : null;
  }

  // Get available translators for a language
  getTranslators(language) {
    const translators = Object.keys(this.translations[language] || {});
    console.log(`Available translators for ${language}:`, translators);
    return translators;
  }

  // Get available tafsir sources for a language
  getTafsirSources(language) {
    const sources = Object.keys(this.tafsir[language] || {});
    console.log(`Available tafsir sources for ${language}:`, sources);
    return sources;
  }

  // Get translator display name
  getTranslatorName(language, translator) {
    return this.translationNames[language]?.[translator] || translator;
  }

  // Get tafsir source display name
  getTafsirName(language, tafsirSource) {
    return this.tafsirNames[language]?.[tafsirSource] || tafsirSource;
  }

  // Search functionality
  searchSuras(query) {
    const allSuras = this.getAllSuras();
    const lowerQuery = query.toLowerCase();

    return allSuras.filter(
      (sura) =>
        sura.name?.toLowerCase().includes(lowerQuery) ||
        sura.nameSimple?.toLowerCase().includes(lowerQuery) ||
        sura.nameArabic?.includes(query) ||
        sura.nameBengali?.includes(query) ||
        sura.id?.toString().includes(query)
    );
  }

  // Get verses with translations
  getVersesWithTranslations(suraId, language, translators = []) {
    const verses = this.getVersesForSura(suraId);

    return verses.map((verse) => {
      const translations = {};

      translators.forEach((translator) => {
        const translation = this.getTranslation(
          verse.verseKey,
          language,
          translator
        );
        if (translation) {
          translations[translator] = {
            text: translation,
            name: this.getTranslatorName(language, translator),
          };
        }
      });

      return {
        ...verse,
        translations,
      };
    });
  }

  // Get random verse
  getRandomVerse() {
    const allVerses = Object.values(ayahData);
    const randomIndex = Math.floor(Math.random() * allVerses.length);
    const randomVerse = allVerses[randomIndex];

    const suraInfo = this.getSuraById(randomVerse.surah_number);

    return {
      verse: {
        id: randomVerse.id,
        ayahNumber: randomVerse.ayah_number,
        verseKey: randomVerse.verse_key,
        text: randomVerse.text,
        wordsCount: randomVerse.words_count,
      },
      sura: suraInfo,
    };
  }

  // Get verse of the day (based on current date)
  getVerseOfTheDay() {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
    );

    const allVerses = Object.values(ayahData);
    const verseIndex = dayOfYear % allVerses.length;
    const verse = allVerses[verseIndex];

    const suraInfo = this.getSuraById(verse.surah_number);

    return {
      verse: {
        id: verse.id,
        ayahNumber: verse.ayah_number,
        verseKey: verse.verse_key,
        text: verse.text,
        wordsCount: verse.words_count,
      },
      sura: suraInfo,
    };
  }

  // Get statistics
  getStatistics() {
    const allSuras = this.getAllSuras();
    const totalVerses = Object.keys(ayahData).length;
    const meccanSuras = allSuras.filter(
      (s) => s.revelationPlace === "makkah"
    ).length;
    const medinanSuras = allSuras.filter(
      (s) => s.revelationPlace === "madinah"
    ).length;

    return {
      totalSuras: allSuras.length,
      totalVerses,
      meccanSuras,
      medinanSuras,
      availableLanguages: Object.keys(this.translations),
      availableTranslations: {
        en: Object.keys(this.translations.en || {}).length,
        bn: Object.keys(this.translations.bn || {}).length,
      },
      availableTafsir: {
        en: Object.keys(this.tafsir.en || {}).length,
        bn: Object.keys(this.tafsir.bn || {}).length,
      },
    };
  }

  // Alias methods for compatibility
  getSuraInfo(id) {
    return this.getSuraById(id);
  }

  getReadingStatistics() {
    return this.getStatistics();
  }

  getAvailableTranslations(language) {
    return this.getTranslators(language).map((translator) => ({
      id: translator,
      name: this.getTranslatorName(language, translator),
      language: language,
    }));
  }

  getAvailableTafsir(language) {
    return this.getTafsirSources(language).map((source) => ({
      id: source,
      name: this.getTafsirName(language, source),
      language: language,
    }));
  }

  // Load recitation data dynamically
  async loadRecitationData(type, reciter) {
    try {
      let recitationData;
      if (type === "ayah-by-ayah") {
        if (reciter === "abdul-basit") {
          recitationData = await import(
            "../assets/data/recitation/ayah-by-ayah/ayah-recitation-abdul-basit-abdul-samad-mujawwad-hafs.json"
          );
        } else if (reciter === "yasser-al-dosari") {
          recitationData = await import(
            "../assets/data/recitation/ayah-by-ayah/ayah-recitation-yasser-al-dosari-murattal-hafs.json"
          );
        }
      } else if (type === "sura-by-sura") {
        if (reciter === "ali-abdur-rahman-al-huthaify") {
          recitationData = await import(
            "../assets/data/recitation/sura-by-sura/ali-abdur-rahman-al-huthaify.json"
          );
        } else if (reciter === "mishari-rashid-al-afasy") {
          recitationData = await import(
            "../assets/data/recitation/sura-by-sura/mishari-rashid-al-afasy.json"
          );
        }
      }
      return recitationData?.default || recitationData;
    } catch (error) {
      console.error("Error loading recitation data:", error);
      return null;
    }
  }

  // Get available reciters
  getAvailableReciters() {
    return {
      "ayah-by-ayah": [
        {
          id: "abdul-basit",
          name: "Abdul Basit Abdul Samad (Mujawwad)",
          language: "ar",
          style: "Mujawwad",
        },
        {
          id: "yasser-al-dosari",
          name: "Yasser Al-Dosari (Murattal)",
          language: "ar",
          style: "Murattal",
        },
      ],
      "sura-by-sura": [
        {
          id: "ali-abdur-rahman-al-huthaify",
          name: "Ali Abdur Rahman Al-Huthaify",
          language: "ar",
          style: "Murattal",
        },
        {
          id: "mishari-rashid-al-afasy",
          name: "Mishari Rashid Al-Afasy",
          language: "ar",
          style: "Murattal",
        },
      ],
    };
  }

  // Get verse recitation
  async getVerseRecitation(suraId, verseNumber, reciter = "abdul-basit") {
    try {
      const recitationData = await this.loadRecitationData(
        "ayah-by-ayah",
        reciter
      );
      if (!recitationData) return null;

      const verseKey = `${suraId}:${verseNumber}`;
      return recitationData[verseKey] || null;
    } catch (error) {
      console.error("Error getting verse recitation:", error);
      return null;
    }
  }

  // Get sura recitation
  async getSuraRecitation(suraId, reciter = "mishari-rashid-al-afasy") {
    try {
      const recitationData = await this.loadRecitationData(
        "sura-by-sura",
        reciter
      );
      if (!recitationData) return null;

      return recitationData[suraId.toString()] || null;
    } catch (error) {
      console.error("Error getting sura recitation:", error);
      return null;
    }
  }

  // Get tafsir with ayah range support
  getTafsirWithRange(
    suraIdOrVerseKey,
    verseNumberOrLanguage,
    tafsirSourceOrSource
  ) {
    const tafsir = this.getTafsir(
      suraIdOrVerseKey,
      verseNumberOrLanguage,
      tafsirSourceOrSource
    );

    if (tafsir && typeof tafsir === "object" && tafsir.ayah_keys) {
      // If tafsir has ayah_keys, it covers multiple verses
      return {
        text: tafsir.text || tafsir.t,
        ayahKeys: tafsir.ayah_keys,
        hasRange: true,
      };
    }

    return {
      text: tafsir,
      ayahKeys: null,
      hasRange: false,
    };
  }
}

export default new DataService();
