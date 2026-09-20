import React from 'react';
import { I18nManager, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { AZKAR_PRIMARY_FONT, getAzkarTheme } from '../theme/azkarTheme';

type SettingsToggleRowProps = {
  label: string;
  checked: boolean;
  onToggle: (nextValue: boolean) => void;
  accessibilityLabel: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  showDivider?: boolean;
  disabled?: boolean;
  disabledOpacity?: number;
};

// Shared settings toggle row: optional icon + label + native Switch, wrapped in
// a Pressable so the whole row is tappable with ripple (Android) / pressed-
// opacity feedback. Layout mirrors the reminder rows in SettingsScreen
// (icon + title on the right, control on the left, hairline divider between
// rows). All colors come from theme tokens so light/solarized/dark adapt
// consistently.
export function SettingsToggleRow({
  label,
  checked,
  onToggle,
  accessibilityLabel,
  icon,
  showDivider = false,
  disabled = false,
  disabledOpacity = 0.5,
}: SettingsToggleRowProps) {
  const themeName = useSelector((state: RootState) => state.theme.value);
  const colors = getAzkarTheme(themeName);

  return (
    <Pressable
      onPress={() => {
        if (!disabled) onToggle(!checked);
      }}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked, disabled }}
      android_ripple={{ color: colors.buttonHoverBgColor, borderless: false }}
      style={({ pressed }) => [
        styles.row,
        showDivider && styles.rowDivider,
        { opacity: disabled ? disabledOpacity : pressed ? 0.7 : 1 },
        showDivider ? { borderBottomColor: colors.buttonBorderColor } : null,
      ]}
    >
      <View style={styles.labelRow}>
        {icon ? <Ionicons name={icon} size={22} color={colors.iconColor} /> : null}
        <Text style={[styles.label, { color: colors.textColor }]} numberOfLines={2}>
          {label}
        </Text>
      </View>
      <View pointerEvents="none">
        <Switch
          value={checked}
          trackColor={{ false: colors.sliderBg, true: colors.sliderBgActive }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={colors.sliderBg}
        />
      </View>
    </Pressable>
  );
}

const IS_RTL = I18nManager.isRTL;

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: IS_RTL ? 'row' : 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  labelRow: {
    flex: 1,
    flexDirection: IS_RTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
