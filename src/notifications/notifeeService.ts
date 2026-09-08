import { Platform } from 'react-native';
import { ADHKAR_CHANNEL, ADHKAR_CHANNEL_ID } from './channels';

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
