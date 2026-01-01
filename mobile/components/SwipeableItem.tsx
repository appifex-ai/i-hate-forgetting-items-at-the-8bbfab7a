import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Pressable } from 'react-native';

interface SwipeableItemProps {
  children: React.ReactNode;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  rightColor?: string;
  leftColor?: string;
  rightIcon?: string;
  leftIcon?: string;
}

export function SwipeableItem({
  children,
  onSwipeRight,
  onSwipeLeft,
  rightColor = '#10b981',
  leftColor = '#ef4444',
  rightIcon = '✓',
  leftIcon = '🗑',
}: SwipeableItemProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const swipeThreshold = 100;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only activate on horizontal swipe
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > swipeThreshold && onSwipeRight) {
          // Swipe right - check off
          Animated.timing(pan, {
            toValue: { x: 400, y: 0 },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            onSwipeRight();
            pan.setValue({ x: 0, y: 0 });
          });
        } else if (gestureState.dx < -swipeThreshold && onSwipeLeft) {
          // Swipe left - delete
          Animated.timing(pan, {
            toValue: { x: -400, y: 0 },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            onSwipeLeft();
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          // Snap back
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* Background actions */}
      <View style={styles.actionsContainer}>
        <View style={[styles.action, { backgroundColor: rightColor }]}>
          <Text style={styles.actionText}>{rightIcon}</Text>
        </View>
        <View style={[styles.action, { backgroundColor: leftColor }]}>
          <Text style={styles.actionText}>{leftIcon}</Text>
        </View>
      </View>

      {/* Swipeable content */}
      <Animated.View
        style={[
          styles.swipeable,
          {
            transform: [{ translateX: pan.x }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 8,
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  action: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 32,
  },
  swipeable: {
    backgroundColor: 'white',
  },
});
