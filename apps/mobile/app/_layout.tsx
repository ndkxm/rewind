import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "../src/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {/* hidden={true} sẽ ẩn hoàn toàn thanh trạng thái (ngày giờ, pin, sóng mạng) */}
      <StatusBar hidden={true} style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: "700" },
        }}
      />
    </SafeAreaProvider>
  );
}
