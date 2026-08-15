import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center px-4">
      <div class="text-5xl mb-4">{{ icon() }}</div>
      <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ title() }}</h3>
      @if (message()) {
        <p class="text-sm text-gray-500 mb-6 max-w-sm">{{ message() }}</p>
      }
      @if (actionLabel()) {
        <button
          (click)="action.emit()"
          class="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `
})
export class EmptyStateComponent {
  readonly icon = input<string>('📭');
  readonly title = input<string>('Nothing here yet');
  readonly message = input<string>('');
  readonly actionLabel = input<string>('');

  readonly action = output<void>();
}
