import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { AZKAR_PRIMARY_FONT, getAzkarTheme } from '../theme/azkarTheme';
import { t } from '../i18n';
import useTimeGuardedCallback from '../utils/useTimeGuardedCallback';
import { config } from '../config/config';

type Props = {
  onOpenSettings: () => void;
  onRequest?: () => void;
  showRequest?: boolean;
};

export function PermissionBlockedBanner({ onOpenSettings, onRequest, showRequest = true }: Props) {
  const themeName = useSelector((s: RootState) => s.theme.value);
  const theme = getAzkarTheme(themeName);

  const guardedOpen = useTimeGuardedCallback(onOpenSettings, config.interaction.navButtonGuardMs);
  const guardedRequest = useTimeGuardedCallback(() => onRequest?.(), config.interaction.navButtonGuardMs);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          backgroundColor: theme.cardBgColor,
          borderColor: theme.buttonBorderColor,
          borderWidth: 1,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 12,
          marginHorizontal: 16,
          marginTop: 8,
        },
        iconWrap: {
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.secondaryBgColor,
        },
        textCol: { flex: 1, gap: 4 },
        title: {
          fontFamily: AZKAR_PRIMARY_FONT,
          fontSize: 14,
          fontWeight: '700',
          color: theme.textColor,
          textAlign: 'right',
          writingDirection: 'rtl',
        },
        body: {
          fontFamily: AZKAR_PRIMARY_FONT,
          fontSize: 12,
          color: theme.secondaryTextColor,
          textAlign: 'right',
          writingDirection: 'rtl',
          lineHeight: 18,
        },
        actions: { flexDirection: 'row', gap: 8, marginTop: 6, justifyContent: 'flex-end' },
        primaryBtn: {
          backgroundColor: theme.sliderBgActive,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 10,
        },
        primaryText: {
          fontFamily: AZKAR_PRIMARY_FONT,
          fontSize: 12,
          fontWeight: '700',
          color: '#FFFFFF',
          textAlign: 'center',
        },
        secondaryBtn: {
          backgroundColor: theme.buttonBgColor,
          borderColor: theme.buttonBorderColor,
          borderWidth: 1,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 10,
        },
        secondaryText: {
          fontFamily: AZKAR_PRIMARY_FONT,
          fontSize: 12,
          fontWeight: '700',
          color: theme.textColor,
          textAlign: 'center',
        },
      }),
    [theme]
  );

  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={styles.iconWrap}>
        <Ionicons name="notifications-off-outline" size={18} color={theme.textColor} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title}>{t('notifPermissionTitle')}</Text>
        <Text style={styles.body}>{t('notifPermissionBody')}</Text>
        <View style={styles.actions}>
          <Pressable
            onPress={guardedOpen}
            style={styles.primaryBtn}
            accessibilityLabel={t('notifPermissionOpenSettings')}
          >
            <Text style={styles.primaryText}>{t('notifPermissionOpenSettings')}</Text>
          </Pressable>
          {showRequest && onRequest ? (
            <Pressable
              onPress={guardedRequest}
              style={styles.secondaryBtn}
              accessibilityLabel={t('notifPermissionRequest')}
            >
              <Text style={styles.secondaryText}>{t('notifPermissionRequest')}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}
