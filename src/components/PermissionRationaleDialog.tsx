import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { AZKAR_PRIMARY_FONT, getAzkarTheme } from '../theme/azkarTheme';
import { t } from '../i18n';
import useTimeGuardedCallback from '../utils/useTimeGuardedCallback';
import { config } from '../config/config';

type Props = {
  visible: boolean;
  onContinue: () => void;
  onCancel: () => void;
};

export function PermissionRationaleDialog({ visible, onContinue, onCancel }: Props) {
  const themeName = useSelector((s: RootState) => s.theme.value);
  const theme = getAzkarTheme(themeName);

  const guardedContinue = useTimeGuardedCallback(onContinue, config.interaction.navButtonGuardMs);
  const guardedCancel = useTimeGuardedCallback(onCancel, config.interaction.navButtonGuardMs);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        },
        card: {
          width: '100%',
          maxWidth: 380,
          backgroundColor: theme.cardBgColor,
          borderColor: theme.buttonBorderColor,
          borderWidth: 1,
          borderRadius: 20,
          paddingHorizontal: 20,
          paddingVertical: 20,
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
          fontSize: 16,
          fontWeight: '700',
          color: theme.textColor,
          textAlign: 'right',
          writingDirection: 'rtl',
        },
        body: {
          fontFamily: AZKAR_PRIMARY_FONT,
          fontSize: 13,
          color: theme.secondaryTextColor,
          textAlign: 'right',
          writingDirection: 'rtl',
          lineHeight: 20,
        },
        iconWrap: {
          width: 40,
          height: 40,
          borderRadius: 20,
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
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 22,
          minWidth: 118,
          alignItems: 'center',
          justifyContent: 'center',
        },
        primaryText: {
          fontFamily: AZKAR_PRIMARY_FONT,
          fontSize: 14,
          fontWeight: '700',
          color: '#FFFFFF',
          textAlign: 'center',
        },
        secondaryBtn: {
          backgroundColor: theme.buttonBgColor,
          borderColor: theme.textColor,
          borderWidth: 1,
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 22,
          minWidth: 118,
          alignItems: 'center',
          justifyContent: 'center',
        },
        secondaryText: {
          fontFamily: AZKAR_PRIMARY_FONT,
          fontSize: 14,
          fontWeight: '700',
          color: theme.textColor,
          textAlign: 'center',
        },
      }),
    [theme]
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={guardedCancel}>
      <View style={styles.overlay}>
        <View style={styles.card} accessibilityRole="alert">
          <View style={styles.topRow}>
            <View style={styles.textCol}>
              <Text style={styles.title}>{t('notifRationaleTitle')}</Text>
              <Text style={styles.body}>{t('notifRationaleBody')}</Text>
            </View>
            <View style={styles.iconWrap}>
              <Ionicons name="notifications-outline" size={20} color={theme.textColor} />
            </View>
          </View>
          <View style={styles.actions}>
            <Pressable
              onPress={guardedContinue}
              style={styles.primaryBtn}
              accessibilityLabel={t('notifRationaleContinue')}
            >
              <Text style={styles.primaryText}>{t('notifRationaleContinue')}</Text>
            </Pressable>
            <Pressable onPress={guardedCancel} style={styles.secondaryBtn} accessibilityLabel={t('cancel')}>
              <Text style={styles.secondaryText}>{t('cancel')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
