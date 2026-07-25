import React, { useState, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { incrementTotalCount } from '../store/slices/totalCountSlice';

export function FreeTasbihScreen() {
  const dispatch = useDispatch();
  const totalCount = useSelector((state: RootState) => state.totalCount.value);
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
    <View style={styles.container}>
      <Text style={styles.title}>تسابيح حرة</Text>
      <Text style={styles.value}>{count}</Text>
      <Pressable onPress={handleTap} style={[styles.button, isAnimating && styles.buttonActive]}>
        <Text style={styles.buttonText}>اضغط</Text>
      </Pressable>
      <Text style={styles.meta}>العداد الإجمالي: {totalCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  value: { fontSize: 64, fontWeight: '800', marginBottom: 20 },
  button: { backgroundColor: '#2563eb', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 16 },
  buttonActive: { transform: [{ scale: 0.97 }] },
  buttonText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  meta: { marginTop: 16, color: '#64748b' },
});
