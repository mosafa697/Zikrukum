import React, { useState, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { incrementTotalCount } from '../store/slices/totalCountSlice';
import { AZKAR_PRIMARY_FONT, getAzkarTheme } from '../theme/azkarTheme';

export function FreeTasbihScreen() {
  const dispatch = useDispatch();
  const totalCount = useSelector((state: RootState) => state.totalCount.value);
  const themeName = useSelector((state: RootState) => state.theme.value);
  const theme = getAzkarTheme(themeName);
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = () => {
    setIsAnimating(true);
    const nextCount = count + 1;
    setCount(nextCount);
    dispatch(incrementTotalCount());
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsAnimating(false), 120);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bgColor }]}> 
      <Text style={[styles.title, { color: theme.textColor }]}>تسابيح حرة</Text>
      <Text style={[styles.value, { color: theme.iconColor }]}>{count}</Text>
      <Pressable
        onPress={handleTap}
        style={[
          styles.button,
          { backgroundColor: theme.buttonBgColor, borderColor: theme.buttonBorderColor },
          isAnimating && styles.buttonActive,
        ]}
      >
        <Text style={[styles.buttonText, { color: theme.textColor }]}>اضغط</Text>
      </Pressable>
      <Text style={[styles.meta, { color: theme.secondaryTextColor }]}>العداد الإجمالي: {totalCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16, fontFamily: AZKAR_PRIMARY_FONT },
  value: { fontSize: 64, fontWeight: '800', marginBottom: 20, fontFamily: AZKAR_PRIMARY_FONT },
  button: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 16, borderWidth: 1 },
  buttonActive: { transform: [{ scale: 0.97 }] },
  buttonText: { fontSize: 22, fontWeight: '700', fontFamily: AZKAR_PRIMARY_FONT },
  meta: { marginTop: 16, fontFamily: AZKAR_PRIMARY_FONT },
});
