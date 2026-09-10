import { getStoredValue, removeStoredValue, setStoredValue } from '../utils/storage';
import { navigateToCategory, navigationRef } from '../navigation/navigationRef';

// Cold-start backup: the killed-state headless handler cannot navigate, so it
// persists the pressed categoryId here and App.tsx consumes it on startup.
export const PENDING_NOTIFICATION_CATEGORY_KEY = 'pending-notification-category';

export function extractCategoryId(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const categoryId = (data as Record<string, unknown>).categoryId;
  if (typeof categoryId === 'number' && Number.isInteger(categoryId)) return String(categoryId);
  if (typeof categoryId === 'string' && categoryId.trim().length > 0) return categoryId.trim();
  return null;
}

export function handleNotificationPress(data: unknown): void {
  const categoryId = extractCategoryId(data);
  if (categoryId) {
    // Unknown ids fall back to Categories inside navigateToCategory — no crash.
    navigateToCategory(categoryId);
    return;
  }
  if (navigationRef.isReady()) navigationRef.navigate('Categories');
  // Otherwise Categories is already the initial route — nothing to do.
}

export async function persistPendingCategory(categoryId: string): Promise<void> {
  await setStoredValue(PENDING_NOTIFICATION_CATEGORY_KEY, categoryId);
}

export async function consumePendingCategory(): Promise<string | null> {
  const categoryId = await getStoredValue<string | null>(PENDING_NOTIFICATION_CATEGORY_KEY, null);
  if (categoryId) await removeStoredValue(PENDING_NOTIFICATION_CATEGORY_KEY);
  return categoryId;
}
