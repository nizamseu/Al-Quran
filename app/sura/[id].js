import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

// Sample verse data - you can replace this with your actual data
const sampleVerses = {
  1: [
    {
      id: 1,
      arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      translation:
        "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    },
    {
      id: 2,
      arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      translation: "All praise is due to Allah, Lord of the worlds.",
    },
    {
      id: 3,
      arabic: "الرَّحْمَٰنِ الرَّحِيمِ",
      translation: "The Entirely Merciful, the Especially Merciful,",
    },
    {
      id: 4,
      arabic: "مَالِكِ يَوْمِ الدِّينِ",
      translation: "Sovereign of the Day of Recompense.",
    },
    {
      id: 5,
      arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      translation: "It is You we worship and You we ask for help.",
    },
    {
      id: 6,
      arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
      translation: "Guide us to the straight path -",
    },
    {
      id: 7,
      arabic:
        "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
      translation:
        "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
    },
  ],
  2: [
    { id: 1, arabic: "الم", translation: "Alif, Lam, Meem." },
    {
      id: 2,
      arabic: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
      translation:
        "This is the Book about which there is no doubt, a guidance for those conscious of Allah -",
    },
    {
      id: 3,
      arabic:
        "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ",
      translation:
        "Who believe in the unseen, establish prayer, and spend out of what We have provided for them,",
    },
  ],
  // Add more suras as needed
};

const suraNames = {
  1: { name: "Al-Fatiha", englishName: "The Opening" },
  2: { name: "Al-Baqarah", englishName: "The Cow" },
  3: { name: "Aal-e-Imran", englishName: "Family of Imran" },
  4: { name: "An-Nisa", englishName: "The Women" },
  5: { name: "Al-Maidah", englishName: "The Table" },
  // Add more sura names as needed
};

export default function SuraDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const suraId = parseInt(id);
  const suraInfo = suraNames[suraId];
  const verses = sampleVerses[suraId] || [];

  if (!suraInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Sura not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.suraNumber}>Sura {suraId}</Text>
        <Text style={styles.suraName}>{suraInfo.name}</Text>
        <Text style={styles.suraEnglishName}>{suraInfo.englishName}</Text>
      </View>

      <View style={styles.versesContainer}>
        {verses.map((verse) => (
          <View key={verse.id} style={styles.verseContainer}>
            <View style={styles.verseNumber}>
              <Text style={styles.verseNumberText}>{verse.id}</Text>
            </View>
            <Text style={styles.arabicText}>{verse.arabic}</Text>
            <Text style={styles.translationText}>{verse.translation}</Text>
          </View>
        ))}

        {verses.length === 0 && (
          <View style={styles.noVersesContainer}>
            <Text style={styles.noVersesText}>
              No verses available for this sura yet.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "white",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 16,
  },
  suraNumber: {
    fontSize: 16,
    color: "#27ae60",
    fontWeight: "bold",
  },
  suraName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginVertical: 8,
  },
  suraEnglishName: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  versesContainer: {
    paddingHorizontal: 16,
  },
  verseContainer: {
    backgroundColor: "white",
    marginBottom: 12,
    borderRadius: 8,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  verseNumber: {
    position: "absolute",
    top: -8,
    right: 16,
    backgroundColor: "#27ae60",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  verseNumberText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  arabicText: {
    fontSize: 20,
    textAlign: "right",
    color: "#2c3e50",
    marginBottom: 12,
    lineHeight: 32,
    fontFamily: "System", // You can add Arabic font later
  },
  translationText: {
    fontSize: 16,
    color: "#34495e",
    lineHeight: 24,
  },
  errorText: {
    fontSize: 18,
    color: "#e74c3c",
    textAlign: "center",
    marginTop: 50,
  },
  noVersesContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  noVersesText: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
  },
});
