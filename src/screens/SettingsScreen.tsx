import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootState } from '../store';
import { setTheme } from '../store/slices/themeSlice';
import { toggleAppearance } from '../store/slices/subTextSlice';
import { incrementFontScale, decrementFontScale } from '../store/slices/fontScaleSlice';
import { resetTotalCount } from '../store/slices/totalCountSlice';
import { toggleShuffle } from '../store/slices/phasesSlice';
import { toggleAudioEnabled, toggleAutoPlayNext } from '../store/slices/audioSlice';
import { toggleVolumeNav } from '../store/slices/volumeNavSlice';
import {
  setEveningTime,
  setFridayTime,
  setMorningTime,
  toggleEvening,
  toggleFriday,
  toggleMorning,
} from '../store/slices/reminderSlice';
import {
  AZKAR_COUNTER_FONT,
  AZKAR_PRIMARY_FONT,
  AZKAR_THEME_MAP,
  getAzkarTheme,
  type AzkarThemeName,
} from '../theme/azkarTheme';
import { t } from '../i18n';
import { formatNumber } from '../utils/numberFormatting';
import { removeStoredValue } from '../utils/storage';
import { azkar } from '../mappers/azkarMapper';
import { ScreenHeader } from '../components/ScreenHeader';
import { PermissionBlockedBanner } from '../components/PermissionBlockedBanner';
import { useNotificationPermissions } from '../notifications/permissions';
import { ADHKAR_CHANNEL_ID } from '../notifications/channels';
import useTimeGuardedCallback from '../utils/useTimeGuardedCallback';
import { config } from '../config/config';

const THEME_SELECTED_BORDER: Record<AzkarThemeName, string> = {
  light: '#000000',
  solarized: '#1E4338',
  dark: '#FFFFFF',
};

const REMINDER_ICONS = {
  morning: 'sunny-outline',
  evening: 'moon-outline',
  friday: 'business-outline',
} as const;

export function SettingsScreen() {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.value) as AzkarThemeName;
  const showSubText = useSelector((state: RootState) => state.subText.value);
  const fontScale = useSelector((state: RootState) => state.fontScale.value);
  const shuffle = useSelector((state: RootState) => state.phases.shuffle);
  const totalCount = useSelector((state: RootState) => state.totalCount.value);
  const autoPlayNext = useSelector((state: RootState) => state.audio.autoPlayNext);
  const audioEnabled = useSelector((state: RootState) => state.audio.audioEnabled);
  const volumeNavEnabled = useSelector((state: RootState) => state.volumeNav.enabled);
  const colors = getAzkarTheme(theme);

  const [resetConfirmVisible, setResetConfirmVisible] = useState(false);
  const reminders = useSelector((s: RootState) => s.reminders);
  const {
    status: notifStatus,
    request: requestNotif,
    openSettings: openNotifSettings,
  } = useNotificationPermissions();
  const notifDenied = notifStatus === 'denied';
  const [pickerTarget, setPickerTarget] = useState<'morning' | 'evening' | 'friday' | null>(null);

  const handleResetTotalCount = async () => {
    await Promise.all(azkar.map((category) => removeStoredValue(`azkar-index-${category.id}`)));
    dispatch(resetTotalCount());
    setResetConfirmVisible(false);
  };

  const formatTime = (hour: number, minute: number) =>
    `${formatNumber(String(hour).padStart(2, '0'))}:${formatNumber(String(minute).padStart(2, '0'))}`;

  const guardedToggleMorning = useTimeGuardedCallback(
    () => dispatch(toggleMorning()),
    config.interaction.navButtonGuardMs
  );
  const guardedToggleEvening = useTimeGuardedCallback(
    () => dispatch(toggleEvening()),
    config.interaction.navButtonGuardMs
  );
  const guardedToggleFriday = useTimeGuardedCallback(
    () => dispatch(toggleFriday()),
    config.interaction.navButtonGuardMs
  );

  const handleTimeChange = (_event: unknown, selectedDate?: Date) => {
    const target = pickerTarget;
    if (Platform.OS === 'android') setPickerTarget(null);
    if (!selectedDate || !target) {
      if (Platform.OS === 'ios') setPickerTarget(null);
      return;
    }
    const hour = selectedDate.getHours();
    const minute = selectedDate.getMinutes();
    if (target === 'morning') dispatch(setMorningTime({ hour, minute }));
    else if (target === 'evening') dispatch(setEveningTime({ hour, minute }));
    else dispatch(setFridayTime({ hour, minute }));
    if (Platform.OS === 'ios') setPickerTarget(null);
  };

  const pickerDate = (() => {
    if (!pickerTarget) return new Date();
    const time =
      pickerTarget === 'morning'
        ? reminders.morning.time
        : pickerTarget === 'evening'
          ? reminders.evening.time
          : reminders.friday.time;
    const d = new Date();
    d.setHours(time.hour, time.minute, 0, 0);
    return d;
  })();

  const renderReminderRow = (
    key: 'morning' | 'evening' | 'friday',
    label: string,
    reminder: { enabled: boolean; time: { hour: number; minute: number } },
    guardedToggle: () => void
  ) => {
    const iconName = REMINDER_ICONS[key];
    const timeText = formatTime(reminder.time.hour, reminder.time.minute);

    return (
      <View
        key={key}
        style={[
          styles.reminderItemRow,
          {
            borderBottomWidth: key !== 'friday' ? StyleSheet.hairlineWidth : 0,
            borderBottomColor: colors.buttonBorderColor,
          },
        ]}
      >
        <View style={styles.reminderLabelRow}>
          <Ionicons name={iconName} size={22} color={colors.iconColor} />
          <Text style={[styles.reminderTitle, { color: colors.textColor }]}>{label}</Text>
        </View>
        <View style={styles.reminderControlsRow}>
          <Pressable
            onPress={() => setPickerTarget(key)}
            style={[
              styles.timePill,
              {
                backgroundColor: colors.secondaryBgColor,
                opacity: reminder.enabled ? 1 : 0.55,
              },
            ]}
            accessibilityLabel={t('pickTime')}
          >
            <Text style={[styles.timePillText, { color: colors.textColor }]}>{timeText}</Text>
          </Pressable>
          <Switch
            value={reminder.enabled}
            onValueChange={() => guardedToggle()}
            disabled={notifDenied}
            trackColor={{ false: colors.sliderBg, true: colors.sliderBgActive }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={colors.sliderBg}
            style={notifDenied ? { opacity: 0.5 } : undefined}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <ScreenHeader title={t('settings')} showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.card,
            {
              ...styles.cardThemed,
              backgroundColor: colors.cardBgColor,
              borderColor: colors.buttonBorderColor,
            },
          ]}
        >
          <Text style={[styles.label, { color: colors.textColor }]}>{t('systemTheme')}</Text>
          <View style={styles.row}>
            {(['light', 'solarized', 'dark'] as AzkarThemeName[]).map((name) => {
              const t = AZKAR_THEME_MAP[name];
              const selected = theme === name;
              return (
                <Pressable
                  key={name}
                  onPress={() => dispatch(setTheme(name))}
                  style={[
                    styles.themeCircle,
                    {
                      backgroundColor: t.bgColor,
                      borderColor: selected ? THEME_SELECTED_BORDER[name] : 'transparent',
                    },
                  ]}
                >
                  <View style={[styles.themeDot, { backgroundColor: t.sliderBgActive }]} />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View
          style={[
            styles.card,
            {
              ...styles.cardThemed,
              backgroundColor: colors.cardBgColor,
              borderColor: colors.buttonBorderColor,
            },
          ]}
        >
          <Text style={[styles.label, { color: colors.textColor }]}>{t('fontSize')}</Text>
          <View style={styles.row}>
            <Pressable
              onPress={() => dispatch(decrementFontScale())}
              style={[
                styles.iconBtn,
                { backgroundColor: colors.buttonBgColor, borderColor: colors.buttonBorderColor },
              ]}
            >
              <Ionicons name="remove" size={20} color={colors.textColor} />
            </Pressable>
            <Text style={[styles.valueText, { color: colors.textColor }]}>
              {formatNumber(fontScale.toFixed(1))}
            </Text>
            <Pressable
              onPress={() => dispatch(incrementFontScale())}
              style={[
                styles.iconBtn,
                { backgroundColor: colors.buttonBgColor, borderColor: colors.buttonBorderColor },
              ]}
            >
              <Ionicons name="add" size={20} color={colors.textColor} />
            </Pressable>
          </View>
        </View>

        <View
          style={[
            styles.card,
            {
              ...styles.cardThemed,
              backgroundColor: colors.cardBgColor,
              borderColor: colors.buttonBorderColor,
            },
          ]}
        >
          <Text style={[styles.label, { color: colors.textColor }]}>{t('settings')}</Text>
          <Pressable onPress={() => dispatch(toggleShuffle())} style={styles.toggleRow}>
            <Text style={[styles.toggleText, { color: colors.textColor }]}>{t('randomOrder')}</Text>
            <View
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: shuffle ? colors.sliderBgActive : colors.buttonBgColor,
                  borderColor: shuffle ? colors.sliderBgActive : colors.buttonBorderColor,
                },
              ]}
            >
              <Ionicons
                name={shuffle ? 'shuffle' : 'list-outline'}
                size={18}
                color={shuffle ? colors.iconColorActive : colors.textColor}
              />
            </View>
          </Pressable>
          <Pressable onPress={() => dispatch(toggleAppearance())} style={styles.toggleRow}>
            <Text style={[styles.toggleText, { color: colors.textColor }]}>{t('showDhikrVirtue')}</Text>
            <View
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: showSubText ? colors.sliderBgActive : colors.buttonBgColor,
                  borderColor: showSubText ? colors.sliderBgActive : colors.buttonBorderColor,
                },
              ]}
            >
              <Ionicons
                name={showSubText ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color={showSubText ? colors.iconColorActive : colors.textColor}
              />
            </View>
          </Pressable>
          <Pressable onPress={() => dispatch(toggleAudioEnabled())} style={styles.toggleRow}>
            <Text style={[styles.toggleText, { color: colors.textColor }]}>{t('audioEnabledLabel')}</Text>
            <View
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: audioEnabled ? colors.sliderBgActive : colors.buttonBgColor,
                  borderColor: audioEnabled ? colors.sliderBgActive : colors.buttonBorderColor,
                },
              ]}
            >
              <Ionicons
                name={audioEnabled ? 'volume-high' : 'volume-mute-outline'}
                size={18}
                color={audioEnabled ? colors.iconColorActive : colors.textColor}
              />
            </View>
          </Pressable>
          <Pressable
            onPress={() => dispatch(toggleAutoPlayNext())}
            disabled={!audioEnabled}
            style={[styles.toggleRow, !audioEnabled && styles.disabledToggleRow]}
          >
            <Text style={[styles.toggleText, { color: colors.textColor }]}>{t('audioLabel')}</Text>
            <View
              style={[
                styles.toggleBtn,
                !audioEnabled && styles.disabledToggleBtn,
                {
                  backgroundColor: autoPlayNext ? colors.sliderBgActive : colors.buttonBgColor,
                  borderColor: autoPlayNext ? colors.sliderBgActive : colors.buttonBorderColor,
                },
              ]}
            >
              <Ionicons
                name={autoPlayNext ? 'play-circle' : 'play-circle-outline'}
                size={18}
                color={
                  !audioEnabled
                    ? colors.secondaryTextColor
                    : autoPlayNext
                      ? colors.iconColorActive
                      : colors.textColor
                }
              />
            </View>
          </Pressable>
          <Pressable onPress={() => dispatch(toggleVolumeNav())} style={styles.toggleRow}>
            <Text style={[styles.toggleText, { color: colors.textColor }]}>{t('volumeNavLabel')}</Text>
            <View
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: volumeNavEnabled ? colors.sliderBgActive : colors.buttonBgColor,
                  borderColor: volumeNavEnabled ? colors.sliderBgActive : colors.buttonBorderColor,
                },
              ]}
            >
              <Ionicons
                name={volumeNavEnabled ? 'play-skip-forward' : 'play-skip-forward-outline'}
                size={18}
                color={volumeNavEnabled ? colors.iconColorActive : colors.textColor}
              />
            </View>
          </Pressable>
        </View>

        {notifDenied ? (
          <PermissionBlockedBanner
            onOpenSettings={() => void openNotifSettings(ADHKAR_CHANNEL_ID)}
            onRequest={() => void requestNotif()}
          />
        ) : null}

        <View
          style={[
            styles.reminderGroupCard,
            {
              ...styles.cardThemed,
              backgroundColor: colors.cardBgColor,
              borderColor: colors.buttonBorderColor,
            },
          ]}
        >
          <Text style={[styles.label, { color: colors.textColor, paddingHorizontal: 14, paddingTop: 4 }]}>
            {t('reminderSchedule')}
          </Text>
          {renderReminderRow('morning', t('morningAdhkarReminder'), reminders.morning, guardedToggleMorning)}
          {renderReminderRow('evening', t('eveningAdhkarReminder'), reminders.evening, guardedToggleEvening)}
          {renderReminderRow('friday', t('fridayAdhkarReminder'), reminders.friday, guardedToggleFriday)}

          {pickerTarget && Platform.OS !== 'web' ? (
            <DateTimePicker
              value={pickerDate}
              mode="time"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          ) : null}
          {pickerTarget && Platform.OS === 'web' ? (
            <View style={styles.webTimeFallback}>
              <Text style={[styles.webTimeText, { color: colors.secondaryTextColor }]}>
                {t('pickTime')}:{' '}
                {formatTime(
                  pickerTarget === 'morning'
                    ? reminders.morning.time.hour
                    : pickerTarget === 'evening'
                      ? reminders.evening.time.hour
                      : reminders.friday.time.hour,
                  pickerTarget === 'morning'
                    ? reminders.morning.time.minute
                    : pickerTarget === 'evening'
                      ? reminders.evening.time.minute
                      : reminders.friday.time.minute
                )}
              </Text>
              <Pressable
                onPress={() => setPickerTarget(null)}
                style={[styles.confirmBtn, { backgroundColor: colors.sliderBgActive }]}
              >
                <Text style={[styles.confirmBtnText, { color: colors.iconColorActive }]}>{t('close')}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View
          style={[
            styles.card,
            {
              ...styles.cardThemed,
              backgroundColor: colors.cardBgColor,
              borderColor: colors.buttonBorderColor,
            },
          ]}
        >
          <Text style={[styles.label, { color: colors.textColor }]}>{t('totalDhikrs')}</Text>
          {resetConfirmVisible ? (
            <View style={styles.row}>
              <Pressable
                onPress={() => setResetConfirmVisible(false)}
                style={[
                  styles.confirmBtn,
                  { backgroundColor: colors.buttonBgColor, borderColor: colors.buttonBorderColor },
                ]}
              >
                <Text style={[styles.confirmBtnText, { color: colors.textColor }]}>{t('cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={handleResetTotalCount}
                style={[styles.confirmBtn, styles.destructiveBtn, { backgroundColor: colors.sliderBgActive }]}
              >
                <Text style={[styles.confirmBtnText, { color: colors.iconColorActive }]}>{t('confirm')}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.totalCounterRow}>
              <Pressable
                onPress={() => setResetConfirmVisible(true)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t('reset')}
                android_ripple={{ color: colors.buttonHoverBgColor, borderless: false }}
                style={({ pressed }) => [
                  styles.iconBtn,
                  {
                    backgroundColor: pressed ? colors.buttonHoverBgColor : colors.buttonBgColor,
                    borderColor: colors.buttonBorderColor,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Ionicons name="trash-outline" size={20} color={colors.textColor} />
              </Pressable>
              <View style={styles.totalCounterContent}>
                <Text
                  style={[
                    styles.countValue,
                    { color: colors.iconColor, backgroundColor: colors.secondaryBgColor },
                  ]}
                >
                  {formatNumber(totalCount)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, gap: 16, paddingBottom: 32 },
  card: { borderRadius: 20, padding: 20 },
  cardThemed: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#000',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'right',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeDot: { width: 16, height: 16, borderRadius: 8 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: AZKAR_PRIMARY_FONT,
    flex: 1,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  disabledToggleRow: { opacity: 0.5 },
  toggleText: { fontSize: 15, fontFamily: AZKAR_PRIMARY_FONT },
  toggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledToggleBtn: { opacity: 0.7 },
  countValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: AZKAR_PRIMARY_FONT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveBtn: { borderWidth: 0 },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'center',
  },
  reminderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  reminderLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reminderControlsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reminderTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  timePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePillText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: AZKAR_COUNTER_FONT,
    textAlign: 'center',
  },
  webTimeFallback: {
    marginTop: 12,
    gap: 8,
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  webTimeText: { fontSize: 13, fontFamily: AZKAR_PRIMARY_FONT, textAlign: 'right' },
  reminderGroupCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  totalCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalCounterContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
});
