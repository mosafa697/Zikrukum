import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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
import { AZKAR_PRIMARY_FONT, AZKAR_THEME_MAP, getAzkarTheme, type AzkarThemeName } from '../theme/azkarTheme';
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

// Border color shown around the selected theme circle
const THEME_SELECTED_BORDER: Record<AzkarThemeName, string> = {
  light: '#2563eb',
  solarized: '#00753a',
  dark: '#ffffff',
};

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

  const [contactOpen, setContactOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [resetConfirmVisible, setResetConfirmVisible] = useState(false);
  const reminders = useSelector((s: RootState) => s.reminders);
  const {
    status: notifStatus,
    request: requestNotif,
    openSettings: openNotifSettings,
  } = useNotificationPermissions();
  const notifDenied = notifStatus === 'denied';
  const [pickerTarget, setPickerTarget] = useState<'morning' | 'evening' | 'friday' | null>(null);

  const handleSendContact = () => {
    if (!contactName.trim() || !contactMsg.trim()) {
      Alert.alert(t('alert'), t('fillNameAndMessage'));
      return;
    }
    const subject = encodeURIComponent(`Zikrukum - ${contactName.trim()}`);
    const body = encodeURIComponent(contactMsg.trim());
    Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
  };

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

  return (
    <View style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <ScreenHeader title={t('settings')} showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.cardBgColor, borderColor: colors.buttonBorderColor },
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
            { backgroundColor: colors.cardBgColor, borderColor: colors.buttonBorderColor },
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
            { backgroundColor: colors.cardBgColor, borderColor: colors.buttonBorderColor },
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

        <View
          style={[
            styles.card,
            { backgroundColor: colors.cardBgColor, borderColor: colors.buttonBorderColor },
          ]}
        >
          <Text style={[styles.label, { color: colors.textColor }]}>{t('reminderTitle')}</Text>
          {notifDenied ? (
            <View style={{ marginHorizontal: -16, marginBottom: 12 }}>
              <PermissionBlockedBanner
                onOpenSettings={() => void openNotifSettings(ADHKAR_CHANNEL_ID)}
                onRequest={() => void requestNotif()}
              />
            </View>
          ) : null}
          <View style={styles.reminderRow}>
            <View style={styles.reminderLabelCol}>
              <Text style={[styles.toggleText, { color: colors.textColor }]}>
                {t('morningAdhkarReminder')}
              </Text>
              <Text style={[styles.reminderSubText, { color: colors.secondaryTextColor }]}>
                {reminders.morning.enabled ? t('reminderEnabled') : t('reminderDisabled')}
              </Text>
            </View>
            <View style={styles.reminderActions}>
              <Pressable
                onPress={() => setPickerTarget('morning')}
                style={[
                  styles.timePill,
                  {
                    backgroundColor: colors.secondaryBgColor,
                    borderColor: colors.buttonBorderColor,
                  },
                ]}
                accessibilityLabel={t('pickTime')}
              >
                <Ionicons name="time-outline" size={16} color={colors.textColor} />
                <Text style={[styles.timePillText, { color: colors.textColor }]}>
                  {formatTime(reminders.morning.time.hour, reminders.morning.time.minute)}
                </Text>
              </Pressable>
              <Pressable
                onPress={guardedToggleMorning}
                style={[
                  styles.toggleBtn,
                  {
                    backgroundColor: reminders.morning.enabled ? colors.sliderBgActive : colors.buttonBgColor,
                    borderColor: reminders.morning.enabled ? colors.sliderBgActive : colors.buttonBorderColor,
                    opacity: notifDenied ? 0.5 : 1,
                  },
                ]}
                disabled={notifDenied}
                accessibilityLabel={t('morningAdhkarReminder')}
              >
                <Ionicons
                  name={reminders.morning.enabled ? 'notifications' : 'notifications-off-outline'}
                  size={18}
                  color={reminders.morning.enabled ? colors.iconColorActive : colors.textColor}
                />
              </Pressable>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.buttonBorderColor }]} />
          <View style={styles.reminderRow}>
            <View style={styles.reminderLabelCol}>
              <Text style={[styles.toggleText, { color: colors.textColor }]}>
                {t('eveningAdhkarReminder')}
              </Text>
              <Text style={[styles.reminderSubText, { color: colors.secondaryTextColor }]}>
                {reminders.evening.enabled ? t('reminderEnabled') : t('reminderDisabled')}
              </Text>
            </View>
            <View style={styles.reminderActions}>
              <Pressable
                onPress={() => setPickerTarget('evening')}
                style={[
                  styles.timePill,
                  {
                    backgroundColor: colors.secondaryBgColor,
                    borderColor: colors.buttonBorderColor,
                  },
                ]}
                accessibilityLabel={t('pickTime')}
              >
                <Ionicons name="time-outline" size={16} color={colors.textColor} />
                <Text style={[styles.timePillText, { color: colors.textColor }]}>
                  {formatTime(reminders.evening.time.hour, reminders.evening.time.minute)}
                </Text>
              </Pressable>
              <Pressable
                onPress={guardedToggleEvening}
                style={[
                  styles.toggleBtn,
                  {
                    backgroundColor: reminders.evening.enabled ? colors.sliderBgActive : colors.buttonBgColor,
                    borderColor: reminders.evening.enabled ? colors.sliderBgActive : colors.buttonBorderColor,
                    opacity: notifDenied ? 0.5 : 1,
                  },
                ]}
                disabled={notifDenied}
                accessibilityLabel={t('eveningAdhkarReminder')}
              >
                <Ionicons
                  name={reminders.evening.enabled ? 'notifications' : 'notifications-off-outline'}
                  size={18}
                  color={reminders.evening.enabled ? colors.iconColorActive : colors.textColor}
                />
              </Pressable>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.buttonBorderColor }]} />
          <View style={styles.reminderRow}>
            <View style={styles.reminderLabelCol}>
              <Text style={[styles.toggleText, { color: colors.textColor }]}>
                {t('fridayAdhkarReminder')}
              </Text>
              <Text style={[styles.reminderSubText, { color: colors.secondaryTextColor }]}>
                {reminders.friday.enabled ? t('reminderEnabled') : t('reminderDisabled')}
              </Text>
            </View>
            <View style={styles.reminderActions}>
              <Pressable
                onPress={() => setPickerTarget('friday')}
                style={[
                  styles.timePill,
                  {
                    backgroundColor: colors.secondaryBgColor,
                    borderColor: colors.buttonBorderColor,
                  },
                ]}
                accessibilityLabel={t('pickTime')}
              >
                <Ionicons name="time-outline" size={16} color={colors.textColor} />
                <Text style={[styles.timePillText, { color: colors.textColor }]}>
                  {formatTime(reminders.friday.time.hour, reminders.friday.time.minute)}
                </Text>
              </Pressable>
              <Pressable
                onPress={guardedToggleFriday}
                style={[
                  styles.toggleBtn,
                  {
                    backgroundColor: reminders.friday.enabled ? colors.sliderBgActive : colors.buttonBgColor,
                    borderColor: reminders.friday.enabled ? colors.sliderBgActive : colors.buttonBorderColor,
                    opacity: notifDenied ? 0.5 : 1,
                  },
                ]}
                disabled={notifDenied}
                accessibilityLabel={t('fridayAdhkarReminder')}
              >
                <Ionicons
                  name={reminders.friday.enabled ? 'notifications' : 'notifications-off-outline'}
                  size={18}
                  color={reminders.friday.enabled ? colors.iconColorActive : colors.textColor}
                />
              </Pressable>
            </View>
          </View>
          <Text style={[styles.rationaleText, { color: colors.secondaryTextColor }]}>
            {t('exactAlarmRationale')}
          </Text>
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
            { backgroundColor: colors.cardBgColor, borderColor: colors.buttonBorderColor },
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
            <View style={styles.row}>
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
              <Text
                style={[
                  styles.countValue,
                  { color: colors.iconColor, backgroundColor: colors.secondaryBgColor },
                ]}
              >
                {formatNumber(totalCount)}
              </Text>
            </View>
          )}
        </View>

        {/* <View
          style={[
            styles.card,
            { backgroundColor: colors.cardBgColor, borderColor: colors.buttonBorderColor },
          ]}
        >
          <Pressable
            onPress={() => setContactOpen((v) => !v)}
            style={[styles.contactBtn, { backgroundColor: colors.sliderBgActive }]}
          >
            <Text style={[styles.contactBtnText, { color: colors.iconColorActive }]}>
              {contactOpen ? t('close') : t('contactMe')}
            </Text>
          </Pressable>
          {contactOpen && (
            <View style={styles.contactForm}>
              <TextInput
                value={contactName}
                onChangeText={setContactName}
                placeholder={t('namePlaceholder')}
                placeholderTextColor={colors.iconColor}
                style={[
                  styles.input,
                  {
                    color: colors.textColor,
                    borderColor: colors.buttonBorderColor,
                    backgroundColor: colors.bgColor,
                  },
                ]}
              />
              <TextInput
                value={contactMsg}
                onChangeText={setContactMsg}
                placeholder={t('messagePlaceholder')}
                placeholderTextColor={colors.iconColor}
                multiline
                numberOfLines={4}
                style={[
                  styles.input,
                  styles.inputMultiline,
                  {
                    color: colors.textColor,
                    borderColor: colors.buttonBorderColor,
                    backgroundColor: colors.bgColor,
                  },
                ]}
              />
              <Pressable
                onPress={() => Linking.openURL('https://github.com/mosafa697/azkar')}
                style={styles.githubRow}
              >
                <Ionicons name="logo-github" size={16} color={colors.iconColor} />
                <Text style={[styles.githubText, { color: colors.iconColor }]}>{t('contributeGithub')}</Text>
              </Pressable>
              <Pressable
                onPress={handleSendContact}
                style={[styles.contactBtn, { backgroundColor: colors.sliderBgActive, marginTop: 4 }]}
              >
                <Text style={[styles.contactBtnText, { color: colors.iconColorActive }]}>{t('send')}</Text>
              </Pressable>
            </View>
          )}
        </View> */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 32 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1 },
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
    paddingVertical: 8,
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
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  reminderLabelCol: { flex: 1, gap: 4, alignItems: 'flex-end' },
  reminderSubText: { fontSize: 12, fontFamily: AZKAR_PRIMARY_FONT, textAlign: 'right' },
  reminderActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  timePillText: { fontSize: 14, fontWeight: '700', fontFamily: AZKAR_PRIMARY_FONT },
  divider: { height: 1, marginVertical: 8 },
  rationaleText: {
    fontSize: 11,
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'right',
    lineHeight: 16,
    marginTop: 8,
  },
  webTimeFallback: { marginTop: 12, gap: 8, alignItems: 'flex-end' },
  webTimeText: { fontSize: 13, fontFamily: AZKAR_PRIMARY_FONT, textAlign: 'right' },
  contactBtn: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  contactBtnText: { fontSize: 14, fontWeight: '700', fontFamily: AZKAR_PRIMARY_FONT, textAlign: 'center' },
  contactForm: { marginTop: 12, gap: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'right',
  },
  inputMultiline: { minHeight: 90, textAlignVertical: 'top' },
  githubRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  githubText: { fontSize: 13, fontFamily: AZKAR_PRIMARY_FONT, textDecorationLine: 'underline' },
});
