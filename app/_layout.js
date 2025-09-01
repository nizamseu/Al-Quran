import { Drawer } from "expo-router/drawer";
import { Tabs } from "expo-router/tabs";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

// Custom beautiful drawer content
function CustomDrawerContent(props) {
  const routes = [
    {
      name: "index",
      label: "Home",
      icon: "home",
      iconType: "Ionicons",
    },
    {
      name: "sura-list",
      label: "Sura List",
      icon: "list",
      iconType: "MaterialIcons",
    },
    {
      name: "settings",
      label: "Settings",
      icon: "settings",
      iconType: "Ionicons",
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Beautiful Header */}
      <View
        style={{
          backgroundColor: "#059669",
          paddingHorizontal: 24,
          paddingVertical: 48,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View style={{ alignItems: "center" }}>
          {/* App Logo/Icon */}
          <View
            style={{
              width: 80,
              height: 80,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 40,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <MaterialIcons name="book" size={40} color="white" />
          </View>

          {/* App Name */}
          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 4,
            }}
          >
            Al-Quran
          </Text>
          <Text
            style={{
              color: "#bbf7d0",
              fontSize: 16,
              fontWeight: "500",
              marginBottom: 8,
            }}
          >
            القرآن الكريم
          </Text>
          <Text style={{ color: "#86efac", fontSize: 14, opacity: 0.9 }}>
            Holy Quran App
          </Text>

          {/* Decorative line */}
          <View
            style={{
              width: 64,
              height: 2,
              backgroundColor: "rgba(255,255,255,0.3)",
              marginTop: 16,
              borderRadius: 1,
            }}
          />
        </View>
      </View>

      {/* Navigation Items */}
      <ScrollView
        style={{ flex: 1, backgroundColor: "#f9fafb" }}
        contentContainerStyle={{ paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {routes.map((route, index) => {
          const isActive =
            props.state.routes[props.state.index]?.name === route.name;

          return (
            <TouchableOpacity
              key={route.name}
              onPress={() => router.push(`/${route.name}`)}
              style={{
                marginHorizontal: 16,
                marginBottom: 8,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 16,
                backgroundColor: isActive ? "#f0fdf4" : "transparent",
                borderLeftWidth: isActive ? 4 : 0,
                borderLeftColor: "#059669",
                shadowColor: isActive ? "#059669" : "transparent",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: isActive ? 3 : 0,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isActive ? "#059669" : "#d1d5db",
                }}
              >
                {route.iconType === "Ionicons" ? (
                  <Ionicons
                    name={route.icon}
                    size={20}
                    color={isActive ? "white" : "#6b7280"}
                  />
                ) : (
                  <MaterialIcons
                    name={route.icon}
                    size={20}
                    color={isActive ? "white" : "#6b7280"}
                  />
                )}
              </View>

              <Text
                style={{
                  marginLeft: 16,
                  fontSize: 16,
                  fontWeight: "500",
                  color: isActive ? "#065f46" : "#374151",
                }}
              >
                {route.label}
              </Text>

              {isActive && (
                <View style={{ marginLeft: "auto" }}>
                  <Ionicons name="chevron-forward" size={16} color="#059669" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Footer Section */}
        <View
          style={{
            marginTop: 32,
            marginHorizontal: 16,
            paddingTop: 24,
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
          }}
        >
          <View
            style={{
              backgroundColor: "#f0fdf4",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Ionicons name="information-circle" size={20} color="#059669" />
              <Text
                style={{ marginLeft: 8, color: "#065f46", fontWeight: "600" }}
              >
                About
              </Text>
            </View>
            <Text style={{ color: "#4b5563", fontSize: 14, lineHeight: 20 }}>
              Experience the divine words of Allah with beautiful recitation and
              translation.
            </Text>
          </View>

          <Text style={{ textAlign: "center", color: "#9ca3af", fontSize: 12 }}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Tab Layout Component
function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#059669",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: focused ? "#f0fdf4" : "transparent",
              }}
            >
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={focused ? 26 : 24}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="sura-list"
        options={{
          title: "Suras",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: focused ? "#f0fdf4" : "transparent",
              }}
            >
              <MaterialIcons
                name="list"
                size={focused ? 26 : 24}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: focused ? "#f0fdf4" : "transparent",
              }}
            >
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={focused ? 26 : 24}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="sura/[id]"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}

export default function Layout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          width: width * 0.85, // 85% of screen width
          backgroundColor: "transparent",
        },
        headerStyle: {
          backgroundColor: "#059669",
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        headerTintColor: "white",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
        headerTitleAlign: "center",
        drawerType: "slide",
        overlayColor: "rgba(0,0,0,0.4)",
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "Al-Quran",
          drawerLabel: "Home",
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="sura/[id]"
        options={{
          drawerItemStyle: { display: "none" },
          title: "Sura Details",
          headerRight: ({ tintColor }) => (
            <View style={{ flexDirection: "row", marginRight: 16 }}>
              <TouchableOpacity style={{ marginRight: 12 }}>
                <Ionicons name="bookmark-outline" size={22} color={tintColor} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="share-outline" size={22} color={tintColor} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
    </Drawer>
  );
}
