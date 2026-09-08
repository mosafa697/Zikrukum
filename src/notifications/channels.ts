import { AndroidImportance } from '@notifee/react-native';

// Single Android channel shared by morning/evening/Friday reminders.
// Keep this the only channel for adhkar reminders so notification settings stay unified.

export const ADHKAR_CHANNEL_ID = 'adhkar-reminders';

export const ADHKAR_CHANNEL = {
  id: ADHKAR_CHANNEL_ID,
  name: 'تذكير الأذكار',
  description: 'تذكير يومي بأذكار الصباح والمساء وأذكار الجمعة',
  importance: AndroidImportance.HIGH,
  sound: 'default',
  vibration: true,
  vibrationPattern: [300, 500],
  badge: true,
  lights: true,
} as const;
