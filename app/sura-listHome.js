import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import CustomTabBar from "../components/CustomTabBar";

// Sample sura data - you can replace this with your actual data
const suraList = [
  {
    id: 1,
    name: "Al-Fatiha",
    englishName: "The Opening",
    verses: 7,
    revelation: "Meccan",
  },
  {
    id: 2,
    name: "Al-Baqarah",
    englishName: "The Cow",
    verses: 286,
    revelation: "Medinan",
  },
  {
    id: 3,
    name: "Aal-e-Imran",
    englishName: "Family of Imran",
    verses: 200,
    revelation: "Medinan",
  },
  {
    id: 4,
    name: "An-Nisa",
    englishName: "The Women",
    verses: 176,
    revelation: "Medinan",
  },
  {
    id: 5,
    name: "Al-Maidah",
    englishName: "The Table",
    verses: 120,
    revelation: "Medinan",
  },
  {
    id: 6,
    name: "Al-Anam",
    englishName: "The Cattle",
    verses: 165,
    revelation: "Meccan",
  },
  {
    id: 7,
    name: "Al-Araf",
    englishName: "The Heights",
    verses: 206,
    revelation: "Meccan",
  },
  {
    id: 8,
    name: "Al-Anfal",
    englishName: "The Spoils of War",
    verses: 75,
    revelation: "Medinan",
  },
  {
    id: 9,
    name: "At-Tawbah",
    englishName: "The Repentance",
    verses: 129,
    revelation: "Medinan",
  },
  {
    id: 10,
    name: "Yunus",
    englishName: "Jonah",
    verses: 109,
    revelation: "Meccan",
  },
];

export default function SuraScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSuras, setFilteredSuras] = useState(suraList);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredSuras(suraList);
    } else {
      const filtered = suraList.filter(
        (sura) =>
          sura.name.toLowerCase().includes(query.toLowerCase()) ||
          sura.englishName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuras(filtered);
    }
  };

  const renderSuraItem = ({ item }) => (
    <TouchableOpacity
      className="bg-white mx-4 mb-3 rounded-2xl shadow-sm border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      onPress={() => router.push(`/sura/${item.id}`)}
    >
      <View className="flex-row items-center p-4">
        {/* Sura Number */}
        <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-4">
          <Text className="text-green-700 font-bold text-base">{item.id}</Text>
        </View>

        {/* Sura Details */}
        <View className="flex-1">
          <Text className="text-gray-800 text-lg font-bold mb-1">
            {item.name}
          </Text>
          <Text className="text-gray-500 text-sm mb-1">{item.englishName}</Text>
          <View className="flex-row items-center">
            <View className="flex-row items-center mr-4">
              <Ionicons
                name="document-text-outline"
                size={14}
                color="#9ca3af"
              />
              <Text className="text-gray-400 text-xs ml-1">
                {item.verses} verses
              </Text>
            </View>
            <View className="flex-row items-center">
              <MaterialIcons
                name={item.revelation === "Meccan" ? "location-city" : "domain"}
                size={14}
                color="#9ca3af"
              />
              <Text className="text-gray-400 text-xs ml-1">
                {item.revelation}
              </Text>
            </View>
          </View>
        </View>

        {/* Arrow */}
        <View className="w-8 h-8 items-center justify-center">
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View className="mx-4 mb-6">
      {/* Search Bar */}
      <View className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-row items-center px-4 py-3 mb-4">
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput
          className="flex-1 ml-3 text-gray-700 text-base"
          placeholder="Search suras..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Stats */}
      <View className="flex-row justify-between mb-4">
        <View className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 flex-1 mr-2">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="book" size={20} color="white" />
            <Text className="text-white text-sm font-medium ml-2">
              Total Suras
            </Text>
          </View>
          <Text className="text-white text-2xl font-bold">114</Text>
        </View>

        <View className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 flex-1 ml-2">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="format-quote" size={20} color="white" />
            <Text className="text-white text-sm font-medium ml-2">
              Total Verses
            </Text>
          </View>
          <Text className="text-white text-2xl font-bold">6,236</Text>
        </View>
      </View>

      {/* Section Title */}
      <Text className="text-gray-800 text-xl font-bold mb-2">
        All Suras {searchQuery && `(${filteredSuras.length} found)`}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={filteredSuras}
        renderItem={renderSuraItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
      />

      {/* Custom Tab Bar */}
      <CustomTabBar />
    </View>
  );
}
