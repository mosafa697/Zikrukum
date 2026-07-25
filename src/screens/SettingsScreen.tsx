import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setTheme } from '../store/slices/themeSlice';
import { toggleAppearance } from '../store/slices/subTextSlice';
import { incrementFontScale, decrementFontScale } from '../store/slices/fontScaleSlice';
import { resetTotalCount } from '../store/slices/totalCountSlice';
import { toggleShuffle } from '../store/slices/phasesSlice';
import { AZKAR_PRIMARY_FONT, getAzkarTheme } from '../theme/azkarTheme';

export function SettingsScreen() {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.value);
  const showSubText = useSelector((state: RootState) => state.subText.value);
  const fontScale = useSelector((state: RootState) => state.fontScale.value);
  const shuffle = useSelector((state: RootState) => state.phases.shuffle);
  const totalCount = useSelector((state: RootState) => state.totalCount.value);
  const colors = getAzkarTheme(theme);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgColor }]}> 
      <Text style={[styles.title, { color: colors.textColor }]}>الإعدادات</Text>
      <View style={[styles.card, { backgroundColor: colors.cardBgColor, borderColor: colors.buttonBorderColor }]}> 
        <Text style={[styles.label, { color: colors.textColor }]}>المظهر</Text>
        <View style={styles.row}> 
          {['light', 'solarized', 'dark'].map((option) => (
            <Pressable
              key={option}
              onPress={() => dispatch(setTheme(option as 'light' | 'solarized' | 'dark'))}
              style={[
                styles.option,
                { backgroundColor: colors.buttonBgColor, borderColor: colors.buttonBorderColor },
                theme === option && { backgroundColor: colors.sliderBgActive, borderColor: colors.sliderBgActive },
              ]}
            >
              <Text style={[styles.optionText, { color: theme === option ? colors.iconColorActive : colors.textColor }]}>{option}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.cardBgColor, borderColor: colors.buttonBorderColor }]}> 
        <Text style={[styles.label, { color: colors.textColor }]}>الخط</Text>
        <View style={styles.row}> 
          <Pressable onPress={() => dispatch(decrementFontScale())} style={[styles.option, { backgroundColor: colors.buttonBgColor, borderColor: colors.buttonBorderColor }]}><Text style={[styles.optionText, { color: colors.textColor }]}>أصغر</Text></Pressable>
          <Text style={[styles.valueText, { color: colors.textColor }]}>{fontScale.toFixed(1)}</Text>
          <Pressable onPress={() => dispatch(incrementFontScale())} style={[styles.option, { backgroundColor: colors.buttonBgColor, borderColor: colors.buttonBorderColor }]}><Text style={[styles.optionText, { color: colors.textColor }]}>أكبر</Text></Pressable>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.cardBgColor, borderColor: colors.buttonBorderColor }]}> 
        <Text style={[styles.label, { color: colors.textColor }]}>الإعدادات الأخرى</Text>
        <Pressable onPress={() => dispatch(toggleAppearance())} style={styles.toggleRow}> 
          <Text style={[styles.toggleText, { color: colors.textColor }]}>إظهار النص الفرعي</Text>
          <Text style={[styles.valueText, { color: colors.secondaryTextColor }]}>{showSubText ? 'مفعّل' : 'معطّل'}</Text>
        </Pressable>
        <Pressable onPress={() => dispatch(toggleShuffle())} style={styles.toggleRow}> 
          <Text style={[styles.toggleText, { color: colors.textColor }]}>ترتيب عشوائي</Text>
          <Text style={[styles.valueText, { color: colors.secondaryTextColor }]}>{shuffle ? 'مفعّل' : 'معطّل'}</Text>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: colors.cardBgColor, borderColor: colors.buttonBorderColor }]}> 
        <Text style={[styles.label, { color: colors.textColor }]}>العداد الإجمالي</Text>
        <Text style={[styles.valueText, { color: colors.textColor }]}>{totalCount}</Text>
        <Pressable onPress={() => dispatch(resetTotalCount())} style={[styles.resetButton, { backgroundColor: colors.sliderBgActive }]}> 
          <Text style={[styles.resetButtonText, { color: colors.iconColorActive }]}>إعادة تعيين</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16, textAlign: 'right', fontFamily: AZKAR_PRIMARY_FONT },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 10, fontFamily: AZKAR_PRIMARY_FONT },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  option: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  optionText: { fontWeight: '600', fontFamily: AZKAR_PRIMARY_FONT },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  toggleText: { fontSize: 15, fontFamily: AZKAR_PRIMARY_FONT },
  valueText: { fontSize: 15, fontWeight: '700', fontFamily: AZKAR_PRIMARY_FONT },
  resetButton: { marginTop: 10, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  resetButtonText: { fontWeight: '700', fontFamily: AZKAR_PRIMARY_FONT },
});
