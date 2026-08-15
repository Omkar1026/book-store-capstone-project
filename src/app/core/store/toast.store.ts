import { signalStore, withState, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';

const AUTO_DISMISS_MS = 4000;

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

const initialState: ToastState = {
  toasts: []
};

export const ToastStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(store => ({
    add(toast: Omit<Toast, 'id'>): void {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, ...toast };
      patchState(store, { toasts: [...store.toasts(), newToast] });

      const delay = toast.duration ?? AUTO_DISMISS_MS;
      setTimeout(() => {
        patchState(store, { toasts: store.toasts().filter(t => t.id !== id) });
      }, delay);
    },

    remove(id: string): void {
      patchState(store, { toasts: store.toasts().filter(t => t.id !== id) });
    },

    clear(): void {
      patchState(store, { toasts: [] });
    }
  }))
);
