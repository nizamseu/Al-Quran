import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const DrawerToggleButton = ({
  style,
  iconColor = "white",
  backgroundColor = "#059669",
}) => {
  const navigation = useNavigation();

  const toggleDrawer = () => {
    navigation.openDrawer();
  };

  return (
    <TouchableOpacity
      onPress={toggleDrawer}
      className="absolute top-12 left-4 z-50"
      style={[
        {
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: backgroundColor,
          justifyContent: "center",
          alignItems: "center",
          elevation: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
        },
        style,
      ]}
    >
      <Ionicons name="menu" size={24} color={iconColor} />
    </TouchableOpacity>
  );
};

export default DrawerToggleButton;
