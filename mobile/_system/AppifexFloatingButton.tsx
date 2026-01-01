/**
 * CRITICAL: DO NOT MODIFY THIS FILE
 *
 * This is a system component required for Appifex sandbox switching functionality.
 * This button allows users to switch back to the Appifex sandbox app from any target app.
 *
 * Modifying or removing this file will break the core Appifex functionality.
 *
 * NOTE: This component only renders on iOS and Android. It returns null on web
 * because expo-secure-store and expo-updates are not supported on web.
 */
import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
  View,
  ActivityIndicator,
  Modal,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import type * as SecureStoreType from 'expo-secure-store';

// SecureStore is only available on iOS and Android
const SecureStore: typeof SecureStoreType | null =
  Platform.OS !== 'web' ? require('expo-secure-store') : null;

// SecureStore keys for cross-app navigation
const RETURN_PROJECT_ID_KEY = 'appifex_return_project_id';
const INITIAL_ROUTE_KEY = 'appifex_initial_route';

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export interface FloatingButtonProps {
  onPress?: () => void;
  children?: React.ReactNode;
  position?: Position;
  size?: number;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

const getPositionStyle = (position: Position, offset: number, bottomInset: number): ViewStyle => {
  // Add extra offset for bottom positions to account for tab bar (~50px) + safe area
  const tabBarHeight = 50;
  const bottomOffset = offset + bottomInset + tabBarHeight;

  const styles: Record<Position, ViewStyle> = {
    'bottom-right': { bottom: bottomOffset, right: offset },
    'bottom-left': { bottom: bottomOffset, left: offset },
    'top-right': { top: offset, right: offset },
    'top-left': { top: offset, left: offset },
  };
  return styles[position];
};

export const AppifexFloatingButton: React.FC<FloatingButtonProps> = ({
  onPress,
  children,
  position = 'bottom-right',
  size = 56,
  backgroundColor = 'transparent',
  style,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  // Don't render on web - SecureStore and expo-updates are not supported
  if (Platform.OS === 'web') {
    return null;
  }

  const handlePress = async () => {
    if (onPress) {
      onPress();
      return;
    }

    // Default behavior: Switch back to Appifex sandbox
    setIsLoading(true);
    try {
      // Read the sandbox channel that was stored when launching this target app
      // Falls back to 'preview' in dev mode, 'production' in production
      const storedChannel = await SecureStore!.getItemAsync('appifex_sandbox_channel');
      const sandboxChannel = storedChannel || (__DEV__ ? 'preview' : 'production');

      // Read project ID and store initial route BEFORE any update operations
      // This ensures the write completes before reloadAsync() kills the process
      const projectId = await SecureStore!.getItemAsync(RETURN_PROJECT_ID_KEY);
      if (projectId) {
        await SecureStore!.setItemAsync(INITIAL_ROUTE_KEY, `/project/${projectId}`);
      }

      Updates.setUpdateURLAndRequestHeadersOverride({
        updateUrl: 'https://u.expo.dev/33e8d11a-ffd9-460c-a556-92afb6ba754a',
        requestHeaders: {
          'expo-channel-name': sandboxChannel,
        },
      });

      // Skip checkForUpdateAsync() - it doesn't work for cross-app switching
      // because it compares bundle hashes between different apps (meaningless)
      const result = await Updates.fetchUpdateAsync();
      if (result.isNew) {
        await Updates.reloadAsync();
      } else {
        // No update available - clean up the initial route to prevent stale navigation
        if (projectId) {
          await SecureStore!.deleteItemAsync(INITIAL_ROUTE_KEY);
        }
        setIsLoading(false);
      }
    } catch (error) {
      // On error, clean up the initial route
      try {
        await SecureStore!.deleteItemAsync(INITIAL_ROUTE_KEY);
      } catch {
        // Ignore cleanup errors
      }
      setIsLoading(false);
      alert(`Error switching to Appifex: ${error}`);
    }
  };

  return (
    <>
      {/* Loading overlay */}
      <Modal visible={isLoading} transparent animationType="fade">
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </Modal>

      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={isLoading}
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isLoading ? 'rgba(153, 153, 153, 0.8)' : backgroundColor,
          },
          getPositionStyle(position, 16, insets.bottom),
          style,
        ]}
      >
        {children || (
          <Image
            source={require('../assets/images/icon.png')}
            style={[styles.icon, { width: size, height: size, borderRadius: size / 2 }]}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 999,
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    // Icon fills the button completely
  },
});
