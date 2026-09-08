import { Platform } from 'react-native';
import { ADHKAR_CHANNEL, ADHKAR_CHANNEL_ID } from './channels';
import { getNextTriggerTimestamp } from './scheduler';
import type { RemindersState } from '../store/slices/reminderSlice';

// Guarded notifee import — web returns the .web mock, native returns the native module.
// If import fails (e.g. Expo Go without native link), callers degrade to no-ops.
let notifee: typeof import('@notifee/react-native').default | null = null;

function getNotifee(): typeof import('@notifee/react-native').default | null {
  if (notifee) return notifee;
  if (Platform.OS === 'web') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    notifee = require('@notifee/react-native').default;
    return notifee;
  } catch {
    return null;
  }
}

export function isNotifeeSupported(): boolean {
  return Platform.OS !== 'web' && getNotifee() !== null;
}

/**
 * Create the single adhkar channel on launch. Idempotent — existing channel is left as-is.
 * Returns true if channel exists/created, false if notifee unavailable (web / Expo Go).
 */
export async function ensureAdhkarChannel(): Promise<boolean> {
  const nf = getNotifee();
  if (!nf) return false;
  try {
    const existing = await nf.getChannel(ADHKAR_CHANNEL_ID);
    if (existing) return true;
    await nf.createChannel({
      id: ADHKAR_CHANNEL.id,
      name: ADHKAR_CHANNEL.name,
      description: ADHKAR_CHANNEL.description,
      importance: ADHKAR_CHANNEL.importance,
      sound: ADHKAR_CHANNEL.sound,
      vibration: ADHKAR_CHANNEL.vibration,
      vibrationPattern: [...ADHKAR_CHANNEL.vibrationPattern],
      badge: ADHKAR_CHANNEL.badge,
      lights: ADHKAR_CHANNEL.lights,
    });
    return true;
  } catch {
    return false;
  }
}

export type NotificationPermissionStatus = 'authorized' | 'denied' | 'provisional' | 'not-determined';

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  const nf = getNotifee();
  if (!nf) return 'denied';
  try {
    const settings = await nf.getNotificationSettings();
    // AuthorizationStatus enum: 0 = NOT_DETERMINED, 1 = DENIED, 2 = AUTHORIZED, 3 = PROVISIONAL
    const s = settings.authorizationStatus as number;
    if (s === 2) return 'authorized';
    if (s === 3) return 'provisional';
    if (s === 1) return 'denied';
    return 'not-determined';
  } catch {
    return 'denied';
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  const nf = getNotifee();
  if (!nf) return 'denied';
  try {
    const settings = await nf.requestPermission();
    const s = settings.authorizationStatus as number;
    if (s === 2) return 'authorized';
    if (s === 3) return 'provisional';
    if (s === 1) return 'denied';
    return 'not-determined';
  } catch {
    return 'denied';
  }
}

export async function openSystemNotificationSettings(channelId?: string): Promise<void> {
  const nf = getNotifee();
  if (!nf) return;
  try {
    await nf.openNotificationSettings(channelId);
  } catch {
    // no-op: settings may be unavailable
  }
}

export async function openAlarmPermissionSettings(): Promise<void> {
  const nf = getNotifee();
  if (!nf) return;
  try {
    await nf.openAlarmPermissionSettings();
  } catch {
    // no-op
  }
}

export async function isBatteryOptimizationEnabled(): Promise<boolean> {
  const nf = getNotifee();
  if (!nf) return false;
  try {
    return await nf.isBatteryOptimizationEnabled();
  } catch {
    return false;
  }
}

export async function openBatteryOptimizationSettings(): Promise<void> {
  const nf = getNotifee();
  if (!nf) return;
  try {
    await nf.openBatteryOptimizationSettings();
  } catch {
    // no-op
  }
}

export async function getPowerManagerInfoSafe(): Promise<
  import('@notifee/react-native/dist/types/PowerManagerInfo').PowerManagerInfo | null
> {
  const nf = getNotifee();
  if (!nf) return null;
  try {
    return await nf.getPowerManagerInfo();
  } catch {
    return null;
  }
}

// --- Scheduling (Task 3 / #15) ---

export const REMINDER_NOTIFICATION_IDS = {
  morning: 'morning-adhkar',
  evening: 'evening-adhkar',
} as const;

async function createDailyTrigger(
  nf: NonNullable<ReturnType<typeof getNotifee>>,
  id: string,
  title: string,
  body: string,
  categoryId: string,
  time: { hour: number; minute: number }
) {
  const timestamps = getNextTriggerTimestamp(time);
  // Use AlarmManager exact if permission granted; fallback to WorkManager automatically.
  await nf.createTriggerNotification(
    {
      id,
      title,
      body,
      data: { categoryId, type: id.startsWith('morning') ? 'morning' : 'evening' },
      android: {
        channelId: ADHKAR_CHANNEL_ID,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
        // Play action wired in #16
      },
      ios: {
        categoryId: 'adhkar-reminder',
      },
    },
    {
      type: 0, // TriggerType.TIMESTAMP
      timestamp: timestamps,
      repeatFrequency: 1, // RepeatFrequency.DAILY
      alarmManager: { type: 3 }, // AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE
    } as unknown as import('@notifee/react-native').TimestampTrigger
  );
}

export async function cancelReminders(): Promise<void> {
  const nf = getNotifee();
  if (!nf) return;
  try {
    await nf.cancelTriggerNotifications(Object.values(REMINDER_NOTIFICATION_IDS));
  } catch {
    // no-op
  }
}

export async function scheduleReminders(reminders: RemindersState): Promise<void> {
  const nf = getNotifee();
  if (!nf) return;
  // Permission gate — no-op if denied (UI already shows banner)
  const status = await getNotificationPermissionStatus();
  if (status === 'denied') return;

  await cancelReminders();
  await ensureAdhkarChannel();

  // Lazy import ar to avoid circular deps at top-level
  const { ar } = await import('../i18n/ar');

  if (reminders.morning.enabled) {
    try {
      await createDailyTrigger(
        nf,
        REMINDER_NOTIFICATION_IDS.morning,
        ar.morningReminderTitle,
        ar.morningReminderBody,
        '3',
        reminders.morning.time
      );
    } catch {
      // scheduling may fail if exact alarm denied — fallback is inexact; ignore error
    }
  }
  if (reminders.evening.enabled) {
    try {
      await createDailyTrigger(
        nf,
        REMINDER_NOTIFICATION_IDS.evening,
        ar.eveningReminderTitle,
        ar.eveningReminderBody,
        '4',
        reminders.evening.time
      );
    } catch {
      // no-op
    }
  }
}

export async function rescheduleReminders(reminders: RemindersState): Promise<void> {
  await scheduleReminders(reminders);
}
