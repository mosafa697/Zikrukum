// Avoid static runtime import of '@notifee/react-native' — it crashes in Expo Go
// ([runtime not ready] Notifee native module not found). Use type-only import.
import type { AndroidImportance } from '@notifee/react-native';

// Single Android channel shared by morning/evening/Friday reminders.
// Keep this the only channel for adhkar reminders so notification settings stay unified.

export const ADHKAR_CHANNEL_ID = 'adhkar-reminders';

// AndroidImportance.HIGH = 4. Hard-coded numeric avoids requiring the native module at bundle load.
const ANDROID_IMPORTANCE_HIGH = 4 as unknown as AndroidImportance;

export const ADHKAR_CHANNEL = {
  id: ADHKAR_CHANNEL_ID,
  name: 'تذكير الأذكار',
  description: 'تذكير يومي بأذكار الصباح والمساء وأذكار الجمعة',
  importance: ANDROID_IMPORTANCE_HIGH,
  sound: 'default',
  vibration: true,
  vibrationPattern: [300, 500],
  badge: true,
  lights: true,
} as const;
