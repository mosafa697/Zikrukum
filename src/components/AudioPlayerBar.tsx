import React, { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  I18nManager,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import type { AzkarTheme } from '../theme/azkarTheme';
import { AZKAR_PRIMARY_FONT, AZKAR_COUNTER_FONT } from '../theme/azkarTheme';
import type { PlaybackStatus } from '../store/slices/playbackSlice';
import { RootState } from '../store';
import { t } from '../i18n';
import { formatAudioTime } from '../utils/numberFormatting';

const BUTTON_SIZE = 44;
const ICON_SIZE = 20;

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
};

function getStatusLabel(status: PlaybackStatus): string {
  switch (status) {
    case 'playing':
      return t('audioPlayingLabel');
    case 'paused':
      return t('audioPausedLabel');
    case 'finished':
      return t('audioFinishedLabel');
    case 'loading':
      return t('audioLoadingLabel');
    case 'error':
      return t('audioError');
    case 'missing':
      return t('audioNoRecordingLabel');
    default:
      return t('audioDefaultLabel');
  }
}

function AudioButton({
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
  const isMissing = status === 'missing';
  const isMutedState = isError || isMissing;

  const iconName = useMemo<ComponentProps<typeof Ionicons>['name']>(() => {
    if (status === 'playing') return 'pause';
    if (status === 'finished') return 'reload';
    if (isError) return 'alert-circle';
    if (isMissing) return 'volume-mute';
    return 'play';
  }, [status, isError, isMissing]);

  return (
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor: isMutedState ? colors.secondaryBgColor : colors.verseGradient[0],
        },
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={status === 'playing' ? t('pauseAudio') : t('playAudio')}
    >
      {status === 'loading' ? (
        <ActivityIndicator size="small" color={colors.textColor} />
      ) : (
        <Ionicons
          name={iconName}
          size={ICON_SIZE}
          color={isMutedState ? colors.secondaryTextColor : colors.verseTextColor}
        />
      )}
    </Pressable>
  );
}

function SpeedButton({ rate, colors, onPress }: { rate: number; colors: AzkarTheme; onPress: () => void }) {
  const isActive = rate !== 1;
  return (
    <Pressable
      style={[
        styles.speedBtn,
        { backgroundColor: isActive ? colors.sliderBgActive : colors.secondaryBgColor },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t('playbackSpeed')}: ${rate}x`}
    >
      <Text
        style={[styles.speedText, { color: isActive ? colors.iconColorActive : colors.secondaryTextColor }]}
      >
        {rate}x
      </Text>
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
        const { trackWidth: w, duration: d } = liveRef.current;
        if (w <= 0 || !Number.isFinite(d) || d <= 0) return;
        const raw = event.nativeEvent.locationX / w;
        const fraction = Math.min(Math.max(I18nManager.isRTL ? 1 - raw : raw, 0), 1);
        setDragging(true);
        setPreview(fraction * d);
      },
      onPanResponderMove: (event) => {
        const { trackWidth: w, duration: d } = liveRef.current;
        if (w <= 0 || !Number.isFinite(d) || d <= 0) return;
        const raw = event.nativeEvent.locationX / w;
        const fraction = Math.min(Math.max(I18nManager.isRTL ? 1 - raw : raw, 0), 1);
        setPreview(fraction * d);
      },
      onPanResponderRelease: (event) => {
        const { trackWidth: w, duration: d, onSeek: seek } = liveRef.current;
        setDragging(false);
        setPreview(null);
        if (w <= 0 || !Number.isFinite(d) || d <= 0) return;
        const raw = event.nativeEvent.locationX / w;
        const fraction = Math.min(Math.max(I18nManager.isRTL ? 1 - raw : raw, 0), 1);
        seek(Math.min(Math.max(fraction * d, 0), d));
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
      <Text style={[styles.timeText, { color: colors.secondaryTextColor, fontFamily: AZKAR_COUNTER_FONT }]}>
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
        <View style={[styles.track, { backgroundColor: colors.sliderBg }]}>
          <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: colors.textColor }]} />
        </View>
      </View>
      <Text style={[styles.timeText, { color: colors.secondaryTextColor, fontFamily: AZKAR_COUNTER_FONT }]}>
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

  const label = getStatusLabel(status);
  const isError = status === 'error';
  const showProgress = status === 'playing' || status === 'paused';
  const showSpeed = status !== 'error';

  return (
    <Pressable
      style={styles.container}
      onPress={isError ? onToggle : undefined}
      disabled={!isError}
      accessibilityLabel={label}
    >
      <AudioButton status={status} colors={colors} onPress={onToggle} />
      {showSpeed ? <SpeedButton rate={rate} colors={colors} onPress={cycleRate} /> : null}
      <View style={styles.info}>
        {showProgress ? (
          <SeekTimeline currentTime={currentTime} duration={duration} colors={colors} onSeek={onSeek} />
        ) : (
          <Text style={[styles.metaText, { color: colors.secondaryTextColor }]}>
            {isError ? t('retryAudio') : formatAudioTime(duration)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedBtn: {
    minWidth: 52,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  speedText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: AZKAR_COUNTER_FONT,
    textAlign: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: AZKAR_PRIMARY_FONT,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  metaText: {
    fontSize: 12,
    fontFamily: AZKAR_PRIMARY_FONT,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seekHit: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'center',
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
  timeText: {
    fontSize: 12,
    minWidth: 28,
    textAlign: 'center',
  },
});
