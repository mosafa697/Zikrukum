import React, { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store';
import { incrementTotalCount } from '../store/slices/totalCountSlice';
import { config } from '../config/config';
import useTimeGuardedCallback from '../utils/useTimeGuardedCallback';
import { AZKAR_PRIMARY_FONT, getAzkarTheme } from '../theme/azkarTheme';
import { t } from '../i18n';

export function FreeTasbihScreen() {
  const dispatch = useDispatch();
  const totalCount = useSelector((state: RootState) => state.totalCount.value);
  const themeName = useSelector((state: RootState) => state.theme.value);
  const theme = getAzkarTheme(themeName);
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tap = useCallback(() => {
    setCount((c) => c + 1);
    dispatch(incrementTotalCount());
    setIsAnimating(true);
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    animTimerRef.current = setTimeout(() => setIsAnimating(false), config.interaction.freeTasbihAnimationMs);
  }, [dispatch]);

  const handleTap = useTimeGuardedCallback(tap, config.interaction.freeTasbihTapGuardMs);

  return (
    <View style={[styles.container, { backgroundColor: theme.bgColor }]}>
      <View style={[styles.card, { backgroundColor: theme.cardBgColor }]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => setCount(0)}
            style={[
              styles.iconBtn,
              { backgroundColor: theme.buttonBgColor, borderColor: theme.buttonBorderColor },
            ]}
            accessibilityLabel={t('reset')}
          >
            <Ionicons name="trash-outline" size={20} color={theme.textColor} />
          </Pressable>
        </View>

        <Text style={[styles.value, { color: theme.iconColor }]}>{count}</Text>

        <Pressable
          onPress={handleTap}
          style={[
            styles.tapBtn,
            { backgroundColor: theme.buttonBgColor, borderColor: theme.buttonBorderColor },
            isAnimating && styles.tapBtnActive,
          ]}
          accessibilityLabel={t('tasbih')}
        >
          <Text style={[styles.tapBtnText, { color: theme.textColor }]}>{t('tasbih')}</Text>
        </Pressable>

        <Text style={[styles.meta, { color: theme.secondaryTextColor }]}>
          {t('totalCounter')}
          {totalCount.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontSize: 72, fontWeight: '800', marginBottom: 32, fontFamily: AZKAR_PRIMARY_FONT },
  tapBtn: { paddingHorizontal: 48, paddingVertical: 18, borderRadius: 20, borderWidth: 1 },
  tapBtnActive: { transform: [{ scale: 0.96 }] },
  tapBtnText: { fontSize: 22, fontWeight: '700', fontFamily: AZKAR_PRIMARY_FONT },
  meta: { marginTop: 24, fontSize: 14, fontFamily: AZKAR_PRIMARY_FONT },
});
