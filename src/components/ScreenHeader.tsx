import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { RootState } from '../store';
import { AZKAR_TITLE_FONT, getAzkarTheme } from '../theme/azkarTheme';
import { t } from '../i18n';

type ScreenHeaderProps = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  bottom?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

// Shared chromeless header: optional left action (or back chevron), centered title, optional right action,
// and an optional bottom row that renders directly under the header.
// Buttons sit directly on the screen background so the header blends into the page.
export function ScreenHeader({
  title,
  showBack = false,
  onBack,
  rightAction,
  leftAction,
  bottom,
  style,
}: ScreenHeaderProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const themeName = useSelector((state: RootState) => state.theme.value);
  const theme = getAzkarTheme(themeName);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={style}>
      <View style={styles.headerRow}>
        <View style={styles.slot}>
          {leftAction ? (
            leftAction
          ) : showBack ? (
            <Pressable
              onPress={handleBack}
              hitSlop={8}
              accessibilityLabel={t('back')}
              style={styles.actionBtn}
            >
              <Ionicons name="chevron-back" size={24} color={theme.textColor} />
            </Pressable>
          ) : null}
        </View>
        <Text style={[styles.title, { color: theme.textColor }]}>{title}</Text>
        <View style={[styles.slot, styles.slotRight]}>{rightAction}</View>
      </View>
      {bottom}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
    marginBottom: 8,
    minHeight: 48,
  },
  slot: { width: 40, alignItems: 'flex-start', justifyContent: 'center' },
  slotRight: { alignItems: 'flex-end' },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '900',
    fontFamily: AZKAR_TITLE_FONT,
    textAlign: 'center',
  },
  actionBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
