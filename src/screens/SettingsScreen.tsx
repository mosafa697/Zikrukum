import React, { useCallback, useState } from 'react';
import {
  I18nManager,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { RootState } from '../store';
import { setTheme } from '../store/slices/themeSlice';
import { toggleAppearance } from '../store/slices/subTextSlice';
import {
  FONT_SCALE_STEPS,
  fontScaleToStep,
  setFontScale,
  stepToFontScale,
} from '../store/slices/fontScaleSlice';
import { resetTotalCount } from '../store/slices/totalCountSlice';
import { toggleShuffle } from '../store/slices/phasesSlice';
import { toggleAudioEnabled, toggleAutoPlayNext } from '../store/slices/audioSlice';
import { toggleVolumeNav } from '../store/slices/volumeNavSlice';
import { toggleHaptics } from '../store/slices/hapticsSlice';
import {
  setEveningEnabled,
  setEveningTime,
  setFridayEnabled,
  setFridayTime,
  setMorningEnabled,
  setMorningTime,
} from '../store/slices/reminderSlice';
import { setMilestonesEnabled } from '../store/slices/milestonesSlice';
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
import { SettingsToggleRow } from '../components/SettingsToggleRow';
import { ThemedSwitch } from '../components/ThemedSwitch';
import { PermissionRationaleDialog } from '../components/PermissionRationaleDialog';
import {
  markRationaleShown,
  useNotificationPermissions,
  wasRationaleShown,
} from '../notifications/permissions';
import { ADHKAR_CHANNEL_ID } from '../notifications/channels';
import { scheduleReminders } from '../notifications/notifeeService';
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

type ReminderKey = 'morning' | 'evening' | 'friday';
type PermissionToggleKey = ReminderKey | 'milestones';

export function SettingsScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useSelector((state: RootState) => state.theme.value) as AzkarThemeName;
  const showSubText = useSelector((state: RootState) => state.subText.value);
  const fontScale = useSelector((state: RootState) => state.fontScale.value);
  const shuffle = useSelector((state: RootState) => state.phases.shuffle);
  const totalCount = useSelector((state: RootState) => state.totalCount.value);
  const autoPlayNext = useSelector((state: RootState) => state.audio.autoPlayNext);
  const audioEnabled = useSelector((state: RootState) => state.audio.audioEnabled);
  const volumeNavEnabled = useSelector((state: RootState) => state.volumeNav.enabled);
  const hapticsEnabled = useSelector((state: RootState) => state.haptics.enabled);
  const colors = getAzkarTheme(theme);
  const fontStep = fontScaleToStep(fontScale);

  const guardedSetFontStep = useTimeGuardedCallback(
    (step: number) => dispatch(setFontScale(stepToFontScale(step))),
    config.interaction.navButtonGuardMs
  );

  const [resetConfirmVisible, setResetConfirmVisible] = useState(false);
  const reminders = useSelector((s: RootState) => s.reminders);
  const milestonesEnabled = useSelector((s: RootState) => s.milestones.enabled);
  const {
    status: notifStatus,
    granted: notifGranted,
    request: requestNotif,
    refresh: refreshNotif,
    openSettings: openNotifSettings,
  } = useNotificationPermissions();
  const notifDenied = notifStatus === 'denied';
  const anyReminderEnabled =
    reminders.morning.enabled || reminders.evening.enabled || reminders.friday.enabled;
  const hasMismatch = (anyReminderEnabled || milestonesEnabled) && !notifGranted;
  const [pickerTarget, setPickerTarget] = useState<'morning' | 'evening' | 'friday' | null>(null);
  // Pending rationale dialog target — one-time pre-permission explainer.
  // 'permission-only' requests the OS permission without enabling any schedule.
  const [rationaleKey, setRationaleKey] = useState<PermissionToggleKey | 'permission-only' | null>(null);

  useFocusEffect(
    useCallback(() => {
      void refreshNotif();
    }, [refreshNotif])
  );

  const handleResetTotalCount = async () => {
    await Promise.all(azkar.map((category) => removeStoredValue(`azkar-index-${category.id}`)));
    dispatch(resetTotalCount());
    setResetConfirmVisible(false);
  };

  const formatTime = (hour: number, minute: number) =>
    `${formatNumber(String(hour).padStart(2, '0'))}:${formatNumber(String(minute).padStart(2, '0'))}`;

  const requestAndEnableMilestones = useCallback(async () => {
    const result = await requestNotif();
    if (result === 'authorized' || result === 'provisional') {
      dispatch(setMilestonesEnabled(true));
      return;
    }
    // Post-request denied => blocked: direct to system Settings, no re-prompt loop.
    // Plain denied keeps Redux off — retry later from Settings.
    if (result === 'denied') {
      await openNotifSettings(ADHKAR_CHANNEL_ID);
    }
  }, [dispatch, requestNotif, openNotifSettings]);

  const handleToggleMilestones = useCallback(
    async (nextValue: boolean) => {
      // OFF always allowed — clears Redux so mismatch resolves by opt-out.
      if (!nextValue) {
        dispatch(setMilestonesEnabled(false));
        return;
      }
      // ON requires real OS permission — never flip on without grant.
      if (notifGranted) {
        dispatch(setMilestonesEnabled(true));
        return;
      }
      // First opt-in while undecided: one-time rationale, then the OS prompt.
      if (notifStatus === 'not-determined' && !(await wasRationaleShown())) {
        setRationaleKey('milestones');
        return;
      }
      await requestAndEnableMilestones();
    },
    [dispatch, notifGranted, notifStatus, requestAndEnableMilestones]
  );

  const guardedToggleMilestones = useTimeGuardedCallback(
    (nextValue: boolean) => void handleToggleMilestones(nextValue),
    config.interaction.navButtonGuardMs
  );

  const guardedOpenAchievements = useTimeGuardedCallback(
    () => navigation.navigate('Achievements'),
    config.interaction.navButtonGuardMs
  );

  const requestAndEnable = useCallback(
    async (key: PermissionToggleKey | 'permission-only') => {
      if (key === 'milestones') {
        await requestAndEnableMilestones();
        return;
      }
      // Status-row request: record the OS decision without flipping any schedule.
      // Toggles enabled afterwards find the grant and turn on directly.
      if (key === 'permission-only') {
        await requestNotif();
        return;
      }
      const setEnabled =
        key === 'morning' ? setMorningEnabled : key === 'evening' ? setEveningEnabled : setFridayEnabled;
      const result = await requestNotif();
      if (result === 'authorized' || result === 'provisional') {
        dispatch(setEnabled(true));
        // Schedule immediately so the first reminder is armed without
        // waiting for the store-subscribe reschedule in App.tsx.
        void scheduleReminders({
          ...reminders,
          [key]: { ...reminders[key], enabled: true },
        });
        return;
      }
      // Post-request denied => blocked: direct to system Settings, no re-prompt loop.
      // Plain denied keeps Redux off — retry later from Settings.
      if (result === 'denied') {
        await openNotifSettings(ADHKAR_CHANNEL_ID);
      }
    },
    [dispatch, requestNotif, openNotifSettings, reminders, requestAndEnableMilestones]
  );

  const handleToggleReminder = useCallback(
    async (key: 'morning' | 'evening' | 'friday', nextValue: boolean) => {
      const setEnabled =
        key === 'morning' ? setMorningEnabled : key === 'evening' ? setEveningEnabled : setFridayEnabled;
      // OFF always allowed — clears Redux so mismatch resolves by opt-out.
      if (!nextValue) {
        dispatch(setEnabled(false));
        return;
      }
      // ON requires real OS permission — never claim on while OS disabled.
      if (notifGranted) {
        dispatch(setEnabled(true));
        void scheduleReminders({
          ...reminders,
          [key]: { ...reminders[key], enabled: true },
        });
        return;
      }
      // First opt-in while undecided: one-time rationale, then the OS prompt.
      if (notifStatus === 'not-determined' && !(await wasRationaleShown())) {
        setRationaleKey(key);
        return;
      }
      await requestAndEnable(key);
    },
    [dispatch, notifGranted, notifStatus, requestAndEnable, reminders]
  );

  const handleRationaleContinue = useTimeGuardedCallback(() => {
    const key = rationaleKey;
    if (!key) return;
    void (async () => {
      await markRationaleShown();
      setRationaleKey(null);
      await requestAndEnable(key);
    })();
  }, config.interaction.navButtonGuardMs);

  const handleRationaleCancel = useTimeGuardedCallback(() => {
    if (!rationaleKey) return;
    // Cancel counts as decided — no repeat rationale, Redux stays off.
    void markRationaleShown().then(() => setRationaleKey(null));
  }, config.interaction.navButtonGuardMs);

  const guardedToggleMorning = useTimeGuardedCallback(
    (nextValue: boolean) => void handleToggleReminder('morning', nextValue),
    config.interaction.navButtonGuardMs
  );
  const guardedToggleEvening = useTimeGuardedCallback(
    (nextValue: boolean) => void handleToggleReminder('evening', nextValue),
    config.interaction.navButtonGuardMs
  );
  const guardedToggleFriday = useTimeGuardedCallback(
    (nextValue: boolean) => void handleToggleReminder('friday', nextValue),
    config.interaction.navButtonGuardMs
  );

  // Notification activation status — real OS permission first, schedule state
  // second. Reminder-scoped wording so it never contradicts the milestones
  // mismatch explainer rendered below it.
  const notifDisplayState: 'active' | 'denied' | 'not-requested' | 'schedules-off' = notifDenied
    ? 'denied'
    : !notifGranted
      ? 'not-requested'
      : !anyReminderEnabled
        ? 'schedules-off'
        : 'active';

  const notifStatusText =
    notifDisplayState === 'active'
      ? t('notifStatusActive')
      : notifDisplayState === 'denied'
        ? t('notifStatusDenied')
        : notifDisplayState === 'not-requested'
          ? t('notifStatusNotRequested')
          : t('notifStatusSchedulesOff');

  const notifStatusIcon =
    notifDisplayState === 'active'
      ? 'checkmark-circle'
      : notifDisplayState === 'denied'
        ? 'alert-circle'
        : notifDisplayState === 'not-requested'
          ? 'notifications-outline'
          : 'pause-circle-outline';

  // Status-row request: one-time rationale, then the OS prompt. No schedule
  // is flipped here, so this never re-prompts unexpectedly.
  const handleStatusRequest = useCallback(async () => {
    if (notifStatus === 'not-determined' && !(await wasRationaleShown())) {
      setRationaleKey('permission-only');
      return;
    }
    await requestNotif();
  }, [notifStatus, requestNotif]);

  const guardedStatusRequest = useTimeGuardedCallback(
    () => void handleStatusRequest(),
    config.interaction.navButtonGuardMs
  );

  const guardedOpenNotifSettings = useTimeGuardedCallback(
    () => void openNotifSettings(ADHKAR_CHANNEL_ID),
    config.interaction.navButtonGuardMs
  );

  // About card actions (#53). Static config only — no network fetch; links
  // hand off to the OS (Play Store / mail client) and fail silently when no
  // handler app exists.
  const appVersion = Constants.expoConfig?.version ?? '';
  const developerCredit = t('developerCredit').replace('{team}', config.about.developerName);

  const openPlayStore = useCallback(() => {
    void Linking.openURL(`market://details?id=${config.about.playPackageId}`).catch(() => {
      void Linking.openURL(config.about.playStoreWebUrl).catch(() => {
        // Fail silently — no store app or handler available.
      });
    });
  }, []);

  const openContactEmail = useCallback(() => {
    void Linking.openURL(`mailto:${config.about.contactEmail}`).catch(() => {
      // Fail silently — no mail client available.
    });
  }, []);

  const guardedOpenPlayStore = useTimeGuardedCallback(openPlayStore, config.interaction.navButtonGuardMs);
  const guardedContactEmail = useTimeGuardedCallback(openContactEmail, config.interaction.navButtonGuardMs);

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
    guardedToggle: (nextValue: boolean) => void
  ) => {
    const iconName = REMINDER_ICONS[key];
    const timeText = formatTime(reminder.time.hour, reminder.time.minute);
    // Never claim on while OS disabled — switch reflects effective state.
    const effectiveEnabled = reminder.enabled && notifGranted;

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
                opacity: effectiveEnabled ? 1 : 0.55,
              },
            ]}
            accessibilityLabel={t('pickTime')}
          >
            <Text style={[styles.timePillText, { color: colors.textColor }]}>{timeText}</Text>
          </Pressable>
          <Pressable
            onPress={() => guardedToggle(!effectiveEnabled)}
            accessibilityRole="switch"
            accessibilityLabel={label}
            accessibilityState={{ checked: effectiveEnabled, disabled: false }}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, styles.reminderSwitchWrap]}
          >
            <View pointerEvents="none">
              <ThemedSwitch checked={effectiveEnabled} colors={colors} />
            </View>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <ScreenHeader title={t('settings')} showBack />
      <PermissionRationaleDialog
        visible={rationaleKey !== null}
        onContinue={handleRationaleContinue}
        onCancel={handleRationaleCancel}
      />
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
              onPress={() => guardedSetFontStep(Math.max(fontStep - 1, 1))}
              accessibilityRole="button"
              accessibilityLabel={t('decreaseFontSize')}
              style={[
                styles.iconBtn,
                { backgroundColor: colors.buttonBgColor, borderColor: colors.buttonBorderColor },
              ]}
            >
              <Ionicons name="remove" size={20} color={colors.textColor} />
            </Pressable>
            <View style={styles.stepsWrap}>
              <Text
                style={[
                  styles.previewText,
                  {
                    color: colors.textColor,
                    fontSize: fontScale * 16,
                    lineHeight: fontScale * 16 * 1.8,
                  },
                ]}
              >
                {t('fontSizePreview')}
              </Text>
            </View>
            <Pressable
              onPress={() => guardedSetFontStep(Math.min(fontStep + 1, FONT_SCALE_STEPS))}
              accessibilityRole="button"
              accessibilityLabel={t('increaseFontSize')}
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
          <SettingsToggleRow
            label={t('randomOrder')}
            checked={shuffle}
            onToggle={() => dispatch(toggleShuffle())}
            accessibilityLabel={t('randomOrder')}
            icon="shuffle"
            showDivider
          />
          <SettingsToggleRow
            label={t('showDhikrVirtue')}
            checked={showSubText}
            onToggle={() => dispatch(toggleAppearance())}
            accessibilityLabel={t('showDhikrVirtue')}
            icon="eye-outline"
            showDivider
          />
          <SettingsToggleRow
            label={t('audioEnabledLabel')}
            checked={audioEnabled}
            onToggle={() => dispatch(toggleAudioEnabled())}
            accessibilityLabel={t('audioEnabledLabel')}
            icon="volume-high"
            showDivider
          />
          <SettingsToggleRow
            label={t('audioLabel')}
            checked={autoPlayNext}
            onToggle={() => dispatch(toggleAutoPlayNext())}
            accessibilityLabel={t('audioLabel')}
            icon="play-circle"
            showDivider
            disabled={!audioEnabled}
          />
          <SettingsToggleRow
            label={t('volumeNavLabel')}
            checked={volumeNavEnabled}
            onToggle={() => dispatch(toggleVolumeNav())}
            accessibilityLabel={t('volumeNavLabel')}
            icon="play-skip-forward"
            showDivider
          />
          <SettingsToggleRow
            label={t('vibrateOnCount')}
            checked={hapticsEnabled}
            onToggle={() => dispatch(toggleHaptics())}
            accessibilityLabel={t('vibrateOnCount')}
            icon="phone-portrait"
          />
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
          <Text style={[styles.label, { color: colors.textColor }]}>{t('reminderSchedule')}</Text>
          <View style={[styles.statusRow, { backgroundColor: colors.secondaryBgColor }]}>
            <Ionicons
              name={notifStatusIcon}
              size={20}
              color={notifDisplayState === 'active' ? colors.sliderBgActive : colors.secondaryTextColor}
            />
            <Text style={[styles.statusText, { color: colors.textColor }]}>{notifStatusText}</Text>
            {notifDisplayState === 'denied' ? (
              <Pressable
                onPress={guardedOpenNotifSettings}
                style={[styles.statusAction, { backgroundColor: colors.sliderBgActive }]}
                accessibilityRole="button"
                accessibilityLabel={t('notifPermissionOpenSettings')}
              >
                <Text style={styles.statusActionText}>{t('notifPermissionOpenSettings')}</Text>
              </Pressable>
            ) : null}
            {notifDisplayState === 'not-requested' ? (
              <Pressable
                onPress={guardedStatusRequest}
                style={[styles.statusAction, { backgroundColor: colors.sliderBgActive }]}
                accessibilityRole="button"
                accessibilityLabel={t('notifPermissionRequest')}
              >
                <Text style={styles.statusActionText}>{t('notifPermissionRequest')}</Text>
              </Pressable>
            ) : null}
          </View>
          {hasMismatch ? (
            <Text
              style={[styles.mismatchWarning, { color: colors.secondaryTextColor }]}
              accessibilityRole="alert"
            >
              {t('notifMismatchWarning')}
            </Text>
          ) : null}
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
          <Text style={[styles.label, { color: colors.textColor, paddingHorizontal: 14, paddingTop: 4 }]}>
            {t('achievements')}
          </Text>
          <SettingsToggleRow
            label={t('milestoneNotifications')}
            checked={milestonesEnabled && notifGranted}
            onToggle={(nextValue) => guardedToggleMilestones(nextValue)}
            accessibilityLabel={t('milestoneNotifications')}
            icon="trophy-outline"
          />
          <View>
            <Pressable
              onPress={guardedOpenAchievements}
              accessibilityRole="button"
              accessibilityLabel={t('openAchievements')}
            >
              <LinearGradient colors={colors.accentGradient} style={styles.achievementsBtn}>
                <Ionicons name="trophy-outline" size={22} color={colors.accentTextColor} />
                <Text style={[styles.achievementsBtnText, { color: colors.accentTextColor }]}>
                  {t('openAchievements')}
                </Text>
                <Ionicons name="chevron-back" size={20} color={colors.accentTextColor} />
              </LinearGradient>
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
          <Text style={[styles.label, styles.aboutLabel, { color: colors.textColor }]}>
            {t('aboutSection')}
          </Text>
          <View style={styles.aboutIdentityRow}>
            <Image source={require('../../assets/icon.png')} style={styles.aboutAppIcon} />
            <View style={styles.aboutIdentityText}>
              <Text style={[styles.aboutAppName, { color: colors.textColor }]}>{config.about.appName}</Text>
              {appVersion ? (
                <Text style={[styles.aboutVersion, { color: colors.secondaryTextColor }]}>
                  {t('appVersionLabel')} {formatNumber(appVersion)}
                </Text>
              ) : null}
            </View>
          </View>
          <Text style={[styles.aboutCredit, { color: colors.secondaryTextColor }]}>{developerCredit}</Text>
          <View style={[styles.aboutLicenseBox, { backgroundColor: colors.secondaryBgColor }]}>
            <Text style={[styles.aboutLicenseText, { color: colors.secondaryTextColor }]}>
              {t('licenseSummary')}
            </Text>
            <Text style={[styles.aboutLicenseCopyright, { color: colors.secondaryTextColor }]}>
              {config.about.licenseCopyright}
            </Text>
          </View>
          {Platform.OS === 'android' ? (
            <Pressable
              onPress={guardedOpenPlayStore}
              accessibilityRole="button"
              accessibilityLabel={t('rateOnPlay')}
            >
              <View
                style={[
                  styles.aboutActionRow,
                  styles.aboutActionRowDivided,
                  { borderBottomColor: colors.buttonBorderColor },
                ]}
              >
                <Ionicons name="star-outline" size={22} color={colors.iconColor} />
                <Text style={[styles.aboutActionText, { color: colors.textColor }]}>{t('rateOnPlay')}</Text>
              </View>
            </Pressable>
          ) : null}
          <Pressable
            onPress={guardedContactEmail}
            accessibilityRole="button"
            accessibilityLabel={t('contactEmailLabel')}
          >
            <View style={styles.aboutActionRow}>
              <Ionicons name="mail-outline" size={22} color={colors.iconColor} />
              <Text style={[styles.aboutActionText, { color: colors.textColor }]}>
                {t('contactEmailLabel')}
              </Text>
            </View>
          </Pressable>
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
    ...Platform.select({
      web: { boxShadow: '0px 4px 16px rgba(0,0,0,0.04)' } as any,
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      },
    }),
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
  stepsWrap: { flex: 1, gap: 8 },
  previewText: {
    fontFamily: AZKAR_PRIMARY_FONT,
    fontWeight: '700',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  reminderSwitchWrap: {
    borderRadius: 20,
  },
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
    // Same vertical metrics as SettingsToggleRow so all toggle rows align.
    minHeight: 48,
    paddingVertical: 10,
    // Native builds force RTL app-wide (I18nManager.forceRTL in index.ts), so
    // 'row' already lays out label-right / controls-left. Web forceRTL is a
    // no-op, so reverse the direction there to match (same platform split as
    // PhraseCard's RTL_MIRROR_SCALE).
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderLabelRow: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  reminderControlsRow: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
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
  mismatchWarning: {
    fontSize: 12,
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 18,
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 14,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 20,
  },
  statusAction: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusActionText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: AZKAR_PRIMARY_FONT,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  achievementsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  achievementsBtnText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'center',
    writingDirection: 'rtl',
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
  aboutLabel: { textAlign: 'center' },
  aboutIdentityRow: {
    // Direction-agnostic: content is centered as a group, so plain 'row'
    // renders the icon leading on the right in forced-RTL native and on the
    // left on web/LTR without any platform split.
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  aboutAppIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  aboutIdentityText: { alignItems: 'center' },
  aboutAppName: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'center',
  },
  aboutVersion: {
    fontSize: 12,
    fontFamily: AZKAR_COUNTER_FONT,
    textAlign: 'center',
    marginTop: 2,
  },
  aboutCredit: {
    fontSize: 13,
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'center',
    writingDirection: 'rtl',
    marginBottom: 12,
  },
  aboutLicenseBox: {
    borderRadius: 14,
    padding: 12,
    gap: 4,
    marginBottom: 12,
  },
  aboutLicenseText: {
    fontSize: 12,
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 18,
  },
  aboutLicenseCopyright: {
    fontSize: 12,
    fontFamily: AZKAR_COUNTER_FONT,
    textAlign: 'center',
  },
  aboutActionRow: {
    // Centered pair (icon + label) — no direction branch needed.
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
    paddingVertical: 8,
  },
  aboutActionRowDivided: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  aboutActionText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
