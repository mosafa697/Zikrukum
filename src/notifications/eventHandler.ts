import { REMINDER_PLAY_ACTION_ID } from './notifeeService';
import { isFeatureEnabled } from '../config/features';
import { playCategory } from '../audio/trackPlayerService';

// Debounce duplicate Play taps (headless + foreground may fire close together)
let lastPlayAt = 0;
const PLAY_DEBOUNCE_MS = 500;

async function handlePlay(categoryId: string): Promise<void> {
  if (!isFeatureEnabled('backgroundAudio')) return;
  const now = Date.now();
  if (now - lastPlayAt < PLAY_DEBOUNCE_MS) return;
  lastPlayAt = now;

  // Explicit user intent — ignore audioEnabled setting, respect autoPlayNext inside playCategory.
  const safeId = categoryId === '3' || categoryId === '4' || categoryId === '21' ? categoryId : '3';
  try {
    const ok = await playCategory(safeId, { startAtCurrentPhrase: true });
    if (!ok) {
      // No tracks (missing audio) — fail silently; TrackPlayer already guards.
    }
  } catch {
    // no-op — missing audio or TrackPlayer not available (web / Expo Go)
  }
}

export function getHandlePlay() {
  return handlePlay;
}

// Foreground event handler shape matches notifee's EventType
export async function handleNotifeeEvent(type: number, detail: unknown): Promise<void> {
  if (!isFeatureEnabled('backgroundAudio')) return;
  // EventType.ACTION_PRESS = 2, PRESS = 1 — we check pressAction.id instead of numeric type.
  const d = detail as {
    pressAction?: { id: string };
    notification?: { data?: { categoryId?: string } };
  } | null;
  const pressId = d?.pressAction?.id;
  const categoryId = d?.notification?.data?.categoryId;
  if (pressId === REMINDER_PLAY_ACTION_ID && categoryId) {
    // For foreground events, type check is optional; background handler also uses this.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _type = type;
    await handlePlay(String(categoryId));
  } else if (pressId === REMINDER_PLAY_ACTION_ID && !categoryId) {
    // Fallback if data missing — try to infer from notification id
    const notif = d?.notification as { id?: string } | undefined;
    const notifId = notif?.id;
    if (notifId?.includes('friday')) await handlePlay('21');
    else if (notifId?.includes('evening')) await handlePlay('4');
    else await handlePlay('3');
  }
}
