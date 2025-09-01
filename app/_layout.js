import { Tabs } from "expo-router/tabs";

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ tabBarLabel: "Home" }} />
      <Tabs.Screen name="sura-list" options={{ tabBarLabel: "Sura List" }} />
      <Tabs.Screen name="settings" options={{ tabBarLabel: "Settings" }} />
      <Tabs.Screen
        name="sura/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
