import React, { useMemo, type ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
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

export type AudioPlayerBarProps = {
  status: PlaybackStatus;
  audioEnabled: boolean;
  audioAvailable: boolean;
  onToggle: () => void;
  colors: AzkarTheme;
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

function ProgressBar({
  currentTime,
  duration,
  colors,
}: {
  currentTime: number;
  duration: number;
  colors: AzkarTheme;
}) {
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  return (
    <View style={styles.progressRow}>
      <Text style={[styles.timeText, { color: colors.secondaryTextColor, fontFamily: AZKAR_COUNTER_FONT }]}>
        {formatAudioTime(currentTime)}
      </Text>
      <View style={[styles.track, { backgroundColor: colors.sliderBg }]}>
        <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: colors.textColor }]} />
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
}: AudioPlayerBarProps) {
  const currentTime = useSelector((state: RootState) => state.playback.currentTime);
  const duration = useSelector((state: RootState) => state.playback.duration);

  if (!audioEnabled || status === 'missing') {
    return null;
  }

  const label = getStatusLabel(status);
  const isError = status === 'error';
  const showProgress = status === 'playing' || status === 'paused';

  return (
    <Pressable
      style={styles.container}
      onPress={isError ? onToggle : undefined}
      disabled={!isError}
      accessibilityLabel={label}
    >
      <AudioButton status={status} colors={colors} onPress={onToggle} />
      <View style={styles.info}>
        {showProgress ? (
          <ProgressBar currentTime={currentTime} duration={duration} colors={colors} />
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
  track: {
    flex: 1,
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
