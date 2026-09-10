import { createNavigationContainerRef } from '@react-navigation/native';
import { azkar } from '../mappers/azkarMapper';
import type { RootStackParamList } from './RootNavigator';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const isReadyRef = { current: false };

const pendingCategoryIds: string[] = [];

export function isKnownCategoryId(categoryId: string): boolean {
  return azkar.some((category) => category.id.toString() === categoryId);
}

export function navigateToCategory(categoryId: string): void {
  const target = isKnownCategoryId(categoryId) ? categoryId : null;
  if (!isReadyRef.current || !navigationRef.isReady()) {
    // Queue known targets for the onReady flush; unknown ids fall back to
    // Categories, which is already the initial route.
    if (target) pendingCategoryIds.push(target);
    return;
  }
  if (target) navigationRef.navigate('Category', { categoryId: target });
  else navigationRef.navigate('Categories');
}

export function flushPendingNavigation(): void {
  if (!isReadyRef.current || !navigationRef.isReady()) return;
  const queued = pendingCategoryIds.splice(0, pendingCategoryIds.length);
  for (const categoryId of queued) navigateToCategory(categoryId);
}
