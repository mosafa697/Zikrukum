import React, { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store';
import { setTheme } from '../store/slices/themeSlice';
import { toggleAppearance } from '../store/slices/subTextSlice';
import { incrementFontScale, decrementFontScale } from '../store/slices/fontScaleSlice';
import { resetTotalCount } from '../store/slices/totalCountSlice';
import { toggleShuffle } from '../store/slices/phasesSlice';
import { AZKAR_PRIMARY_FONT, AZKAR_THEME_MAP, getAzkarTheme, type AzkarThemeName } from '../theme/azkarTheme';
import { t } from '../i18n';
import { formatNumber } from '../utils/numberFormatting';
import { removeStoredValue } from '../utils/storage';
import { azkar } from '../mappers/azkarMapper';
import { ScreenHeader } from '../components/ScreenHeader';

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
  const colors = getAzkarTheme(theme);

  const [contactOpen, setContactOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [resetConfirmVisible, setResetConfirmVisible] = useState(false);

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

        <View
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
        </View>
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
  toggleText: { fontSize: 15, fontFamily: AZKAR_PRIMARY_FONT },
  toggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
