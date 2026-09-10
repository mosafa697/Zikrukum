import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import {
  getNotificationPermissionStatus,
  isNotifeeSupported,
  openSystemNotificationSettings,
  requestNotificationPermission,
  type NotificationPermissionStatus,
} from './notifeeService';

export type UseNotificationPermissionsReturn = {
  supported: boolean;
  status: NotificationPermissionStatus;
  loading: boolean;
  denied: boolean;
  granted: boolean;
  request: () => Promise<NotificationPermissionStatus>;
  refresh: () => Promise<void>;
  openSettings: (channelId?: string) => Promise<void>;
};

export function useNotificationPermissions(): UseNotificationPermissionsReturn {
  const supported = isNotifeeSupported();
  const [status, setStatus] = useState<NotificationPermissionStatus>(supported ? 'not-determined' : 'denied');
  const [loading, setLoading] = useState(supported);

  const refresh = useCallback(async () => {
    if (!supported) {
      setStatus('denied');
      setLoading(false);
      return;
    }
    if (Platform.OS === 'web') {
      setStatus('denied');
      setLoading(false);
      return;
    }
    const next = await getNotificationPermissionStatus();
    setStatus(next);
    setLoading(false);
  }, [supported]);

  const request = useCallback(async () => {
    if (!supported || Platform.OS === 'web') return 'denied' as const;
    setLoading(true);
    const next = await requestNotificationPermission();
    setStatus(next);
    setLoading(false);
    return next;
  }, [supported]);

  const openSettings = useCallback(async (channelId?: string) => {
    await openSystemNotificationSettings(channelId);
  }, []);

  useEffect(() => {
    void refresh();
    // Re-check when app returns to foreground (user may have changed settings externally)
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') void refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return {
    supported,
    status,
    loading,
    denied: status === 'denied',
    granted: status === 'authorized' || status === 'provisional',
    request,
    refresh,
    openSettings,
  };
}

/**
 * Exact-alarm helpers: Android 12+ SCHEDULE_EXACT_ALARM / Android 14+ USE_EXACT_ALARM.
 * Notifee trigger notifications will still schedule with inexact AlarmManager if denied,
 * but may drift ~15 min in Doze. We surface the helper so Settings can link to system screen.
 */
export async function checkExactAlarmAvailable(): Promise<boolean> {
  // For now, assume available — real check requires native AlarmManager.canScheduleExactAlarms()
  // which notifee exposes via side-channel only; degrade to true and document fallback.
  if (Platform.OS !== 'android') return true;
  return true;
}

export async function requestExactAlarmPermission(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const { openAlarmPermissionSettings } = await import('./notifeeService');
  await openAlarmPermissionSettings();
}
