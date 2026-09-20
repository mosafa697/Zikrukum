import React, { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { AzkarTheme } from '../theme/azkarTheme';

// Purely visual, fully-themed replacement for the native Switch on Android,
// whose thumb is tinted from the native theme (colorAccent) and can only be
// MULTIPLY-tinted via JS — i.e. its hue cannot be overridden per app theme.
// Rendering our own track + thumb gives exact per-theme colors everywhere.
const TRACK_WIDTH = 50;
const TRACK_HEIGHT = 30;
const THUMB_SIZE = 24;
const THUMB_INSET = 3;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - THUMB_INSET * 2;

export function ThemedSwitch({ checked, colors }: { checked: boolean; colors: AzkarTheme }) {
  // Thumb travel replicates the native switch the user is used to:
  // off = visual left, on = visual right, regardless of RTL.
  const progress = useMemo(() => new Animated.Value(checked ? 1 : 0), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    Animated.timing(progress, {
      toValue: checked ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [checked, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [THUMB_INSET, THUMB_INSET + THUMB_TRAVEL],
  });

  return (
    <View
      style={[
        styles.track,
        {
          backgroundColor: checked ? colors.switchTrackActive : colors.sliderBg,
        },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [{ translateX }],
            backgroundColor: checked ? colors.switchThumbActive : '#FFFFFF',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    position: 'absolute',
    left: 0,
  },
});
