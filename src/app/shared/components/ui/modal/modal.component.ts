import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        (click)="onBackdropClick($event)">
        <!-- Dialog -->
        <div
          role="dialog"
          [attr.aria-label]="title()"
          class="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
          (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">{{ title() }}</h2>
            @if (closeable()) {
              <button
                (click)="close.emit()"
                class="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="Close">
                ✕
              </button>
            }
          </div>

          <!-- Body slot -->
          <div class="px-6 py-4 overflow-y-auto flex-1">
            <ng-content select="[slot=body]" />
          </div>

          <!-- Footer slot -->
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <ng-content select="[slot=footer]" />
          </div>
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly title = input<string>('');
  readonly closeable = input<boolean>(true);
  readonly closeOnBackdrop = input<boolean>(true);

  readonly close = output<void>();

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop()) {
      this.close.emit();
    }
  }
}
