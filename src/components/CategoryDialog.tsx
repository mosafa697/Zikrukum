import React, { useMemo, type ComponentProps } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { AZKAR_PRIMARY_FONT, getAzkarTheme } from '../theme/azkarTheme';
import useTimeGuardedCallback from '../utils/useTimeGuardedCallback';
import { config } from '../config/config';

export type CategoryDialogAction = {
  label: string;
  onPress: () => void;
  primary?: boolean;
};

type Props = {
  visible: boolean;
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
  actions: CategoryDialogAction[];
  onRequestClose: () => void;
  accessibilityLabel: string;
};

// Generic themed RTL dialog for CategoryScreen notices (completion #37,
// exit confirmation #38). Mirrors the PermissionRationaleDialog card pattern:
// overlay + card tokens, guarded buttons, fontScale-aware text.
export function CategoryDialog({
  visible,
  icon,
  title,
  body,
  actions,
  onRequestClose,
  accessibilityLabel,
}: Props) {
  const themeName = useSelector((s: RootState) => s.theme.value);
  const fontScale = useSelector((s: RootState) => s.fontScale.value);
  const theme = getAzkarTheme(themeName);

  const guardedClose = useTimeGuardedCallback(onRequestClose, config.interaction.navButtonGuardMs);

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
          fontSize: 16 * fontScale,
          fontWeight: '700',
          color: theme.textColor,
          textAlign: 'right',
          writingDirection: 'rtl',
        },
        body: {
          fontFamily: AZKAR_PRIMARY_FONT,
          fontSize: 13 * fontScale,
          color: theme.secondaryTextColor,
          textAlign: 'right',
          writingDirection: 'rtl',
          lineHeight: 20 * fontScale,
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
      }),
    [theme, fontScale]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={guardedClose}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.overlay}>
        <View style={styles.card} accessibilityRole="alert">
          <View style={styles.topRow}>
            <View style={styles.textCol}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.body}>{body}</Text>
            </View>
            <View style={styles.iconWrap}>
              <Ionicons name={icon} size={20} color={theme.textColor} />
            </View>
          </View>
          <View style={styles.actions}>
            {actions.map((action) => (
              <DialogActionButton
                key={action.label}
                label={action.label}
                onPress={action.onPress}
                primary={action.primary}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DialogActionButton({
  label,
  onPress,
  primary,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  const themeName = useSelector((s: RootState) => s.theme.value);
  const fontScale = useSelector((s: RootState) => s.fontScale.value);
  const theme = getAzkarTheme(themeName);
  const guardedPress = useTimeGuardedCallback(onPress, config.interaction.navButtonGuardMs);

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
          fontSize: 14 * fontScale,
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
          fontSize: 14 * fontScale,
          fontWeight: '700',
          color: theme.textColor,
          textAlign: 'center',
        },
      }),
    [theme, fontScale]
  );

  if (primary) {
    return (
      <Pressable onPress={guardedPress} style={styles.primaryBtn} accessibilityLabel={label}>
        <Text style={styles.primaryText}>{label}</Text>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={guardedPress} style={styles.secondaryBtn} accessibilityLabel={label}>
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}
