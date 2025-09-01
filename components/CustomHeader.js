import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CustomHeader = ({
  title,
  showBackButton = false,
  showDrawerButton = true,
  rightComponent = null,
  backgroundColor = "#059669",
  textColor = "white",
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleDrawerToggle = () => {
    navigation.openDrawer();
  };

  return (
    <>
      <StatusBar
        barStyle={textColor === "white" ? "light-content" : "dark-content"}
        backgroundColor={backgroundColor}
        translucent={false}
      />
      <View
        className="shadow-lg"
        style={{
          backgroundColor: backgroundColor,
          paddingTop: Platform.OS === "ios" ? insets.top : 0,
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
      >
        <View className="flex-row items-center justify-between px-4 py-4">
          {/* Left Side - Back or Drawer Button */}
          <View className="w-10 h-10 items-center justify-center">
            {showBackButton ? (
              <TouchableOpacity
                onPress={handleBackPress}
                className="w-10 h-10 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                <Ionicons name="arrow-back" size={22} color={textColor} />
              </TouchableOpacity>
            ) : showDrawerButton ? (
              <TouchableOpacity
                onPress={handleDrawerToggle}
                className="w-10 h-10 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                <Ionicons name="menu" size={22} color={textColor} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Center - Title */}
          <View className="flex-1 items-center">
            <Text
              className="text-lg font-bold"
              style={{ color: textColor }}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>

          {/* Right Side - Custom Component */}
          <View className="w-10 h-10 items-center justify-center">
            {rightComponent}
          </View>
        </View>
      </View>
    </>
  );
};

export default CustomHeader;
