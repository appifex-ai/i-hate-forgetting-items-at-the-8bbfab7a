import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
// CRITICAL: DO NOT REMOVE - Required for Appifex sandbox switching
import { AppifexFloatingButton } from '../_system/AppifexFloatingButton';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      {/* CRITICAL: DO NOT REMOVE - Required for Appifex sandbox switching */}
      <AppifexFloatingButton />
    </>
  );
}
