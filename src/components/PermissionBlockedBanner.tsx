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
          backgroundColor: theme.cardBgColor,
          borderColor: theme.buttonBorderColor,
          borderWidth: 1,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 16,
          gap: 12,
        },
        topRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        },
        textCol: { flex: 1, gap: 6, alignItems: 'flex-end' },
        title: {
          fontFamily: AZKAR_PRIMARY_FONT,
          fontSize: 15,
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
        iconWrap: {
          width: 38,
          height: 38,
          borderRadius: 19,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.secondaryBgColor,
        },
        actions: {
          flexDirection: 'row',
          gap: 10,
          marginTop: 4,
          justifyContent: 'flex-start',
          flexWrap: 'wrap',
        },
        primaryBtn: {
          backgroundColor: theme.sliderBgActive,
          paddingHorizontal: 18,
          paddingVertical: 9,
          borderRadius: 22,
          minWidth: 118,
          alignItems: 'center',
          justifyContent: 'center',
        },
        primaryText: {
          fontFamily: AZKAR_PRIMARY_FONT,
          fontSize: 13,
          fontWeight: '700',
          color: '#FFFFFF',
          textAlign: 'center',
        },
        secondaryBtn: {
          backgroundColor: theme.buttonBgColor,
          borderColor: theme.textColor,
          borderWidth: 1,
          paddingHorizontal: 18,
          paddingVertical: 9,
          borderRadius: 22,
          minWidth: 118,
          alignItems: 'center',
          justifyContent: 'center',
        },
        secondaryText: {
          fontFamily: AZKAR_PRIMARY_FONT,
          fontSize: 13,
          fontWeight: '700',
          color: theme.textColor,
          textAlign: 'center',
        },
      }),
    [theme]
  );

  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={styles.topRow}>
        <View style={styles.textCol}>
          <Text style={styles.title}>{t('notifPermissionTitle')}</Text>
          <Text style={styles.body}>{t('notifPermissionBody')}</Text>
        </View>
        <View style={styles.iconWrap}>
          <Ionicons name="notifications-off-outline" size={18} color={theme.textColor} />
        </View>
      </View>
      <View style={styles.actions}>
        {showRequest && onRequest ? (
          <Pressable
            onPress={guardedRequest}
            style={styles.primaryBtn}
            accessibilityLabel={t('notifPermissionRequest')}
          >
            <Text style={styles.primaryText}>{t('notifPermissionRequest')}</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={guardedOpen}
          style={styles.secondaryBtn}
          accessibilityLabel={t('notifPermissionOpenSettings')}
        >
          <Text style={styles.secondaryText}>{t('notifPermissionOpenSettings')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
