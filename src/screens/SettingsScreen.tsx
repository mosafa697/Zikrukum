import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setTheme } from '../store/slices/themeSlice';
import { toggleAppearance } from '../store/slices/subTextSlice';
import { incrementFontScale, decrementFontScale } from '../store/slices/fontScaleSlice';
import { resetTotalCount } from '../store/slices/totalCountSlice';
import { toggleShuffle } from '../store/slices/phasesSlice';

export function SettingsScreen() {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.value);
  const showSubText = useSelector((state: RootState) => state.subText.value);
  const fontScale = useSelector((state: RootState) => state.fontScale.value);
  const shuffle = useSelector((state: RootState) => state.phases.shuffle);
  const totalCount = useSelector((state: RootState) => state.totalCount.value);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>الإعدادات</Text>
      <View style={styles.card}>
        <Text style={styles.label}>المظهر</Text>
        <View style={styles.row}> 
          {['light', 'solarized', 'dark'].map((option) => (
            <Pressable key={option} onPress={() => dispatch(setTheme(option))} style={[styles.option, theme === option && styles.optionActive]}> 
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>الخط</Text>
        <View style={styles.row}> 
          <Pressable onPress={() => dispatch(decrementFontScale())} style={styles.option}><Text style={styles.optionText}>أصغر</Text></Pressable>
          <Text style={styles.valueText}>{fontScale.toFixed(1)}</Text>
          <Pressable onPress={() => dispatch(incrementFontScale())} style={styles.option}><Text style={styles.optionText}>أكبر</Text></Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>الإعدادات الأخرى</Text>
        <Pressable onPress={() => dispatch(toggleAppearance())} style={styles.toggleRow}> 
          <Text style={styles.toggleText}>إظهار النص الفرعي</Text>
          <Text style={styles.valueText}>{showSubText ? 'مفعّل' : 'معطّل'}</Text>
        </Pressable>
        <Pressable onPress={() => dispatch(toggleShuffle())} style={styles.toggleRow}> 
          <Text style={styles.toggleText}>ترتيب عشوائي</Text>
          <Text style={styles.valueText}>{shuffle ? 'مفعّل' : 'معطّل'}</Text>
        </Pressable>
      </View>

      <View style={styles.card}> 
        <Text style={styles.label}>العداد الإجمالي</Text>
        <Text style={styles.valueText}>{totalCount}</Text>
        <Pressable onPress={() => dispatch(resetTotalCount())} style={styles.resetButton}> 
          <Text style={styles.resetButtonText}>إعادة تعيين</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16, textAlign: 'right' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  option: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#e2e8f0' },
  optionActive: { backgroundColor: '#2563eb' },
  optionText: { color: '#0f172a', fontWeight: '600' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  toggleText: { fontSize: 15 },
  valueText: { fontSize: 15, fontWeight: '700' },
  resetButton: { marginTop: 10, backgroundColor: '#dc2626', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  resetButtonText: { color: '#fff', fontWeight: '700' },
});
