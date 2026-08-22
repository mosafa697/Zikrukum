import React, { useEffect, useMemo } from 'react';
import { Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { AZKAR_COUNTER_FONT, getAzkarTheme } from '../theme/azkarTheme';
import { formatNumber } from '../utils/numberFormatting';

// ─── Constants ───────────────────────────────────────────────────────────────
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const BASE_SIZE = 190;
const MAX_SIZE = Math.min(SCREEN_WIDTH - 48, SCREEN_HEIGHT * 0.45);
const MAX_COUNT = 1000;

// ─── Props ───────────────────────────────────────────────────────────────────
interface TasbihButtonProps {
  readonly onPress: () => void;
  readonly count?: number;
  readonly accessibilityLabel?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function TasbihButton({ onPress, count = 0, accessibilityLabel }: TasbihButtonProps) {
  const themeName = useSelector((state: RootState) => state.theme.value);
  const theme = getAzkarTheme(themeName);
  const breathe = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(1), []);
  const animatedSize = useMemo(() => new Animated.Value(BASE_SIZE), []);

  // ── Breathing animation ───────────────────────────────────────────────────
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1600, useNativeDriver: false }),
        Animated.timing(breathe, { toValue: 0, duration: 1600, useNativeDriver: false }),
      ])
    ).start();
  }, [breathe]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.035, duration: 1600, useNativeDriver: false }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 1600, useNativeDriver: false }),
      ])
    ).start();
  }, [scaleAnim]);

  // ── Grow on count change ──────────────────────────────────────────────────
  useEffect(() => {
    const clampedCount = Math.min(count, MAX_COUNT);
    const progress = clampedCount / MAX_COUNT;
    const targetSize = BASE_SIZE + (MAX_SIZE - BASE_SIZE) * progress;

    Animated.spring(animatedSize, {
      toValue: targetSize,
      useNativeDriver: false, // layout props require JS driver
      speed: 20,
      bounciness: 4,
    }).start();
  }, [count, animatedSize]);

  // ── Derived animated values ───────────────────────────────────────────────
  const glowOpacity = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.6],
  });

  const innerSize = animatedSize.interpolate({
    inputRange: [BASE_SIZE, MAX_SIZE],
    outputRange: [BASE_SIZE - 20, MAX_SIZE - 20],
  });

  const glowSize = animatedSize.interpolate({
    inputRange: [BASE_SIZE, MAX_SIZE],
    outputRange: [BASE_SIZE + 20, MAX_SIZE + 20],
  });

  const outerRadius = animatedSize.interpolate({
    inputRange: [BASE_SIZE, MAX_SIZE],
    outputRange: [BASE_SIZE / 2, MAX_SIZE / 2],
  });

  const innerRadius = innerSize.interpolate({
    inputRange: [BASE_SIZE - 20, MAX_SIZE - 20],
    outputRange: [(BASE_SIZE - 20) / 2, (MAX_SIZE - 20) / 2],
  });

  const glowRadius = glowSize.interpolate({
    inputRange: [BASE_SIZE + 20, MAX_SIZE + 20],
    outputRange: [(BASE_SIZE + 20) / 2, (MAX_SIZE + 20) / 2],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? formatNumber(count)}
    >
      {/* Hit area grows with the button */}
      <Animated.View
        style={{
          width: animatedSize,
          height: animatedSize,
          borderRadius: outerRadius,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer glow ring */}
        <Animated.View
          style={[
            styles.glowRing,
            {
              backgroundColor: theme.tasbihGlowColor,
              opacity: glowOpacity,
              transform: [{ scale: scaleAnim }],
              width: glowSize,
              height: glowSize,
              borderRadius: glowRadius,
            },
          ]}
        />

        {/* Main button */}
        <Animated.View
          style={[
            styles.buttonWrap,
            {
              shadowColor: theme.tasbihShadowColor,
              transform: [{ scale: scaleAnim }],
              width: innerSize,
              height: innerSize,
              borderRadius: innerRadius,
            },
          ]}
        >
          {/* SVG fills 100% of the container via viewBox */}
          <Svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${MAX_SIZE} ${MAX_SIZE}`}
            style={StyleSheet.absoluteFill}
          >
            <Defs>
              <RadialGradient id="tasbihGrad" cx="38%" cy="35%" r="65%" fx="38%" fy="38%">
                <Stop offset="0%" stopColor={theme.tasbihGradient[0]} stopOpacity="1" />
                <Stop offset="45%" stopColor={theme.tasbihGradient[1]} stopOpacity="1" />
                <Stop offset="100%" stopColor={theme.tasbihGradient[2]} stopOpacity="1" />
              </RadialGradient>
            </Defs>
            <Circle cx={MAX_SIZE / 2} cy={MAX_SIZE / 2} r={MAX_SIZE / 2} fill="url(#tasbihGrad)" />
          </Svg>

          <Text style={[styles.label, { color: theme.tasbihTextColor }]}>{formatNumber(count)}</Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  glowRing: {
    position: 'absolute',
  },
  buttonWrap: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  label: {
    fontFamily: AZKAR_COUNTER_FONT,
    fontSize: 48,
    fontWeight: '900',
    color: '#F3ECD8',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

export default TasbihButton;
