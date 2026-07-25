import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { azkar } from '../mappers/azkarMapper';
import { setPhases } from '../store/slices/phasesSlice';
import { setPhasesLengthCount, setIndexCount } from '../store/slices/indexCountSlice';
import { RootState } from '../store';
import { PhraseCard } from '../components/PhraseCard';

export function CategoryScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Category'>>();
  const categoryId = route.params?.categoryId ?? '1';
  const categoryData = azkar.find((item) => item.id.toString() === categoryId);
  const currentPhrase = useSelector((state: RootState) => state.phases.value[state.indexCount.value]);
  const phrases = useSelector((state: RootState) => state.phases.value);

  useEffect(() => {
    if (categoryData?.phrases) {
      dispatch(setPhases(categoryData.phrases));
      dispatch(setPhasesLengthCount(categoryData.phrases.length - 1));
      dispatch(setIndexCount(0));
    }
  }, [categoryData, dispatch]);

  if (!categoryData) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>الفئة غير موجودة</Text>
      </View>
    );
  }

  if (!currentPhrase) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>جارٍ تحميل الذكر...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}> 
      <PhraseCard phrase={currentPhrase} categoryName={categoryData.title} />
      <View style={styles.footerActions}> 
        <Text style={styles.footerText}>العدد المتبقي: {currentPhrase.count}</Text>
        <Text style={styles.footerText}>الذكريات: {phrases.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8 },
  title: { fontSize: 20, textAlign: 'center', marginTop: 24 },
  footerActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  footerText: { fontSize: 12, color: '#64748b' },
});
