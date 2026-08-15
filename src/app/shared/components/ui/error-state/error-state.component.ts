import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center px-4">
      <div class="text-5xl mb-4">⚠️</div>
      <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ title() }}</h3>
      @if (message()) {
        <p class="text-sm text-gray-500 mb-6 max-w-sm">{{ message() }}</p>
      }
      @if (retryLabel()) {
        <button
          (click)="retry.emit()"
          class="bg-red-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-red-700 transition-colors">
          {{ retryLabel() }}
        </button>
      }
    </div>
  `
})
export class ErrorStateComponent {
  readonly title = input<string>('Something went wrong');
  readonly message = input<string>('An unexpected error occurred. Please try again.');
  readonly retryLabel = input<string>('Try Again');

  readonly retry = output<void>();
}
