import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

// Sample sura data - you can replace this with your actual data
const suraList = [
  { id: 1, name: "Al-Fatiha", englishName: "The Opening", verses: 7 },
  { id: 2, name: "Al-Baqarah", englishName: "The Cow", verses: 286 },
  { id: 3, name: "Aal-e-Imran", englishName: "Family of Imran", verses: 200 },
  { id: 4, name: "An-Nisa", englishName: "The Women", verses: 176 },
  { id: 5, name: "Al-Maidah", englishName: "The Table", verses: 120 },
  { id: 6, name: "Al-Anam", englishName: "The Cattle", verses: 165 },
  { id: 7, name: "Al-Araf", englishName: "The Heights", verses: 206 },
  { id: 8, name: "Al-Anfal", englishName: "The Spoils of War", verses: 75 },
  { id: 9, name: "At-Tawbah", englishName: "The Repentance", verses: 129 },
  { id: 10, name: "Yunus", englishName: "Jonah", verses: 109 },
];

export default function SuraScreen() {
  const router = useRouter();

  const renderSuraItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suraItem}
      onPress={() => router.push(`/sura/${item.id}`)}
    >
      <View style={styles.suraInfo}>
        <Text style={styles.suraNumber}>{item.id}</Text>
        <View style={styles.suraDetails}>
          <Text style={styles.suraName}>{item.name}</Text>
          <Text style={styles.suraEnglishName}>{item.englishName}</Text>
          <Text style={styles.verseCount}>{item.verses} verses</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sura List</Text>
      <FlatList
        data={suraList}
        renderItem={renderSuraItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
    textAlign: "center",
  },
  suraItem: {
    backgroundColor: "white",
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suraInfo: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  suraNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#27ae60",
    marginRight: 16,
    minWidth: 30,
  },
  suraDetails: {
    flex: 1,
  },
  suraName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  suraEnglishName: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  verseCount: {
    fontSize: 12,
    color: "#95a5a6",
  },
});
