import { create } from 'zustand';
import * as Haptics from 'expo-haptics';

export type ToastKind = 'success' | 'error' | 'info';

interface ToastState {
  id: number;
  message: string | null;
  kind: ToastKind;
  show: (message: string, kind?: ToastKind) => void;
  hide: () => void;
}

let timer: ReturnType<typeof setTimeout> | undefined;

export const useToastStore = create<ToastState>((set) => ({
  id: 0,
  message: null,
  kind: 'info',
  show: (message, kind = 'success') => {
    if (timer) clearTimeout(timer);
    set((s) => ({ id: s.id + 1, message, kind }));
    if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (kind === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    timer = setTimeout(() => set({ message: null }), 2500);
  },
  hide: () => set({ message: null }),
}));

/** Non-hook helper for use outside components. */
export const toast = {
  success: (message: string) => useToastStore.getState().show(message, 'success'),
  error: (message: string) => useToastStore.getState().show(message, 'error'),
  info: (message: string) => useToastStore.getState().show(message, 'info'),
};
