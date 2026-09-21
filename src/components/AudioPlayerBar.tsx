import React, { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { AzkarTheme } from '../theme/azkarTheme';
import { AZKAR_COUNTER_FONT } from '../theme/azkarTheme';
import type { PlaybackStatus } from '../store/slices/playbackSlice';
import { RootState } from '../store';
import { t } from '../i18n';
import { formatAudioTime } from '../utils/numberFormatting';

const PRIMARY_SIZE = 44;
const SECONDARY_SIZE = 36;
const PRIMARY_ICON_SIZE = 20;
const SECONDARY_ICON_SIZE = 18;
const SEEK_DELTA_SECONDS = 10;
const THUMB_SIZE = 12;
const TRACK_ROW_HEIGHT = 14;

// The player is internally LTR (progress direction, time labels, control
// order) while the rest of the screen stays RTL. Native builds force RTL
// app-wide (I18nManager.forceRTL in index.ts), so the player container opts
// out with `direction: 'ltr'` — children inherit it and PanResponder's
// locationX then maps directly onto the visual track. On web forceRTL is a
// no-op (the player is never mirrored), and the web style validator rejects
// `direction`, so web skips it.
const LTR_DIRECTION = Platform.select<ViewStyle>({
  web: {},
  default: { direction: 'ltr' },
});

// Selectable speeds, in cycle order starting from normal speed.
export const PLAYBACK_RATES = [1, 1.25, 1.5, 2, 0.5, 0.75];

export type AudioPlayerBarProps = {
  status: PlaybackStatus;
  audioEnabled: boolean;
  audioAvailable: boolean;
  onToggle: () => void;
  colors: AzkarTheme;
  rate: number;
  onRateChange: (rate: number) => void;
  onSeek: (seconds: number) => void;
  repeat: boolean;
  onRepeatChange: (repeat: boolean) => void;
};

function AudioPlayButton({
  status,
  colors,
  onPress,
}: {
  status: PlaybackStatus;
  colors: AzkarTheme;
  onPress: () => void;
}) {
  const isDisabled = status === 'loading';
  const isError = status === 'error';

  const iconName = useMemo<ComponentProps<typeof Ionicons>['name']>(() => {
    if (status === 'playing') return 'pause';
    if (status === 'finished') return 'reload';
    if (isError) return 'alert-circle';
    return 'play';
  }, [status, isError]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: isError ? colors.playerSecondaryBg : colors.playerFill },
        pressed && !isDisabled && styles.pressedScale,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={isError ? t('retryAudio') : status === 'playing' ? t('pauseAudio') : t('playAudio')}
    >
      {status === 'loading' ? (
        <ActivityIndicator size="small" color={colors.playerSecondaryText} />
      ) : (
        <Ionicons
          name={iconName}
          size={PRIMARY_ICON_SIZE}
          color={isError ? colors.playerSecondaryText : colors.iconColorActive}
        />
      )}
    </Pressable>
  );
}

function SpeedButton({ rate, colors, onPress }: { rate: number; colors: AzkarTheme; onPress: () => void }) {
  const isActive = rate !== 1;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.secondaryButton,
        { backgroundColor: colors.playerSecondaryBg },
        pressed && styles.pressedScale,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t('playbackSpeed')}: ${rate}x`}
    >
      <Text style={[styles.speedText, { color: isActive ? colors.playerFill : colors.playerText }]}>
        {rate}x
      </Text>
    </Pressable>
  );
}

function SeekStepButton({
  direction,
  colors,
  disabled,
  onPress,
}: {
  direction: 'back' | 'forward';
  colors: AzkarTheme;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.secondaryButton,
        { backgroundColor: colors.playerSecondaryBg },
        disabled && styles.disabledSecondary,
        pressed && !disabled && styles.pressedScale,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={direction === 'back' ? t('audioSeekBackLabel') : t('audioSeekForwardLabel')}
      accessibilityState={{ disabled }}
    >
      <MaterialCommunityIcons
        name={direction === 'back' ? 'rewind-10' : 'fast-forward-10'}
        size={SECONDARY_ICON_SIZE}
        color={colors.playerSecondaryText}
      />
    </Pressable>
  );
}

function RepeatButton({
  active,
  colors,
  onPress,
}: {
  active: boolean;
  colors: AzkarTheme;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.secondaryButton,
        { backgroundColor: active ? colors.playerSecondaryBgActive : colors.playerSecondaryBg },
        pressed && styles.pressedScale,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('audioRepeatLabel')}
      accessibilityState={{ selected: active }}
    >
      <Ionicons
        name="repeat"
        size={SECONDARY_ICON_SIZE}
        color={active ? colors.playerFill : colors.playerSecondaryText}
      />
    </Pressable>
  );
}

function SeekTimeline({
  currentTime,
  duration,
  colors,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  colors: AzkarTheme;
  onSeek: (seconds: number) => void;
}) {
  const currentPhraseId = useSelector((state: RootState) => state.playback.currentPhraseId);
  const [trackWidth, setTrackWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);

  // Fresh phrase (or reset player) cancels any in-flight drag.
  useEffect(() => {
    setDragging(false);
    setPreview(null);
  }, [currentPhraseId]);

  const liveRef = useRef({ trackWidth: 0, duration: 0, onSeek });
  liveRef.current = { trackWidth, duration, onSeek };

  // The player container is direction: 'ltr', so locationX runs left-to-right
  // matching the visual track — no RTL flip needed.
  const fractionToSeconds = (locationX: number): number | null => {
    const { trackWidth: w, duration: d } = liveRef.current;
    if (w <= 0 || !Number.isFinite(d) || d <= 0 || !Number.isFinite(locationX)) return null;
    return Math.min(Math.max(locationX / w, 0), 1) * d;
  };

  // Single stable responder: tap commits immediately, drag previews and
  // commits on release. The 250 ms time poll never fights the finger because
  // the shown position comes from the preview while dragging.
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        const { duration: d } = liveRef.current;
        return Number.isFinite(d) && d > 0;
      },
      onMoveShouldSetPanResponder: (_event, gesture) => {
        const { duration: d } = liveRef.current;
        return Number.isFinite(d) && d > 0 && Math.abs(gesture.dx) > 4;
      },
      onPanResponderGrant: (event) => {
        const seconds = fractionToSeconds(event.nativeEvent.locationX);
        if (seconds === null) return;
        setDragging(true);
        setPreview(seconds);
      },
      onPanResponderMove: (event) => {
        const seconds = fractionToSeconds(event.nativeEvent.locationX);
        if (seconds === null) return;
        setPreview(seconds);
      },
      onPanResponderRelease: (event) => {
        setDragging(false);
        setPreview(null);
        const seconds = fractionToSeconds(event.nativeEvent.locationX);
        if (seconds === null) return;
        liveRef.current.onSeek(seconds);
      },
      onPanResponderTerminate: () => {
        setDragging(false);
        setPreview(null);
      },
    })
  ).current;

  const shown = dragging && preview !== null ? preview : currentTime;
  const progress = duration > 0 ? Math.min(shown / duration, 1) : 0;

  return (
    <View style={styles.progressRow}>
      <Text style={[styles.timeText, styles.timeTextCurrent, { color: colors.playerTimeText }]}>
        {formatAudioTime(shown)}
      </Text>
      <View
        style={styles.seekHit}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
        accessibilityRole="adjustable"
        accessibilityLabel={t('seekAudioHint')}
        accessibilityValue={{ min: 0, max: Math.round(duration), now: Math.round(shown) }}
      >
        <View style={styles.trackRow}>
          <View style={[styles.track, { backgroundColor: colors.playerTrack }]}>
            <View
              style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: colors.playerFill }]}
            />
          </View>
          <View
            style={[
              styles.thumb,
              {
                left: `${progress * 100}%`,
                backgroundColor: colors.playerFill,
                borderColor: colors.cardBgColor,
              },
            ]}
          />
        </View>
      </View>
      <Text style={[styles.timeText, styles.timeTextTotal, { color: colors.playerTimeText }]}>
        {formatAudioTime(duration)}
      </Text>
    </View>
  );
}

export function AudioPlayerBar({
  status,
  audioEnabled,
  audioAvailable,
  onToggle,
  colors,
  rate,
  onRateChange,
  onSeek,
  repeat,
  onRepeatChange,
}: AudioPlayerBarProps) {
  const currentTime = useSelector((state: RootState) => state.playback.currentTime);
  const duration = useSelector((state: RootState) => state.playback.duration);

  if (!audioEnabled || status === 'missing') {
    return null;
  }

  const cycleRate = () => {
    const index = PLAYBACK_RATES.indexOf(rate);
    onRateChange(PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length] ?? 1);
  };

  // ±10s buttons operate on the committed poll time and are inert without a
  // known duration; the hook's seekTo clamps to [0, duration].
  const canSeek = Number.isFinite(duration) && duration > 0;

  return (
    <View style={[styles.container, LTR_DIRECTION]}>
      <SeekTimeline currentTime={currentTime} duration={duration} colors={colors} onSeek={onSeek} />
      <View style={styles.controlsRow}>
        <SpeedButton rate={rate} colors={colors} onPress={cycleRate} />
        <SeekStepButton
          direction="back"
          colors={colors}
          disabled={!canSeek}
          onPress={() => onSeek(currentTime - SEEK_DELTA_SECONDS)}
        />
        <AudioPlayButton status={status} colors={colors} onPress={onToggle} />
        <SeekStepButton
          direction="forward"
          colors={colors}
          disabled={!canSeek}
          onPress={() => onSeek(currentTime + SEEK_DELTA_SECONDS)}
        />
        <RepeatButton active={repeat} colors={colors} onPress={() => onRepeatChange(!repeat)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 2,
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  primaryButton: {
    width: PRIMARY_SIZE,
    height: PRIMARY_SIZE,
    borderRadius: PRIMARY_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    width: SECONDARY_SIZE,
    height: SECONDARY_SIZE,
    borderRadius: SECONDARY_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressedScale: { transform: [{ scale: 0.96 }] },
  disabledSecondary: { opacity: 0.4 },
  speedText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: AZKAR_COUNTER_FONT,
    textAlign: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seekHit: {
    flex: 1,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  trackRow: {
    height: TRACK_ROW_HEIGHT,
    position: 'relative',
    justifyContent: 'center',
    overflow: 'visible',
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: (TRACK_ROW_HEIGHT - THUMB_SIZE) / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 2,
    marginLeft: -THUMB_SIZE / 2,
  },
  timeText: {
    fontSize: 11,
    minWidth: 26,
    fontFamily: AZKAR_COUNTER_FONT,
    fontVariant: ['tabular-nums'],
  },
  timeTextCurrent: { textAlign: 'left' },
  timeTextTotal: { textAlign: 'right' },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
});
