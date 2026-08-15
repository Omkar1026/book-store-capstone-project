import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastStore, Toast } from '../../../../core/store/toast.store';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full"
      aria-live="polite"
      aria-atomic="false">
      @for (toast of toastStore.toasts(); track toast.id) {
        <div
          [class]="toastClass(toast)"
          class="flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg text-sm transition-all">
          <span class="text-lg leading-none mt-0.5">{{ toastIcon(toast.type) }}</span>
          <p class="flex-1">{{ toast.message }}</p>
          <button
            (click)="dismiss(toast.id)"
            class="text-current opacity-60 hover:opacity-100 ml-2 text-xs font-bold shrink-0">
            ✕
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  readonly toastStore = inject(ToastStore);

  dismiss(id: string): void {
    this.toastStore.remove(id);
  }

  toastClass(toast: Toast): string {
    const map: Record<Toast['type'], string> = {
      success: 'bg-green-600 text-white',
      error: 'bg-red-600 text-white',
      info: 'bg-indigo-600 text-white',
      warning: 'bg-yellow-500 text-gray-900'
    };
    return map[toast.type];
  }

  toastIcon(type: Toast['type']): string {
    const icons: Record<Toast['type'], string> = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };
    return icons[type];
  }
}
