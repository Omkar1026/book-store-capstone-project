import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ProgressStep {
  label: string;
  path?: string;
}

@Component({
  selector: 'app-progress-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="flex items-center justify-center gap-0 mb-8" aria-label="Checkout progress">
      @for (step of steps(); track step.label; let i = $index; let last = $last) {
        <!-- Step circle -->
        <div class="flex items-center">
          <div class="flex flex-col items-center">
            <div
              [class.bg-indigo-600]="i <= currentStep()"
              [class.text-white]="i <= currentStep()"
              [class.bg-gray-200]="i > currentStep()"
              [class.text-gray-500]="i > currentStep()"
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors">
              @if (i < currentStep()) {
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              } @else {
                {{ i + 1 }}
              }
            </div>
            <span
              [class.text-indigo-600]="i === currentStep()"
              [class.font-semibold]="i === currentStep()"
              class="text-xs mt-1 text-gray-500 whitespace-nowrap">
              {{ step.label }}
            </span>
          </div>
          <!-- Connector line -->
          @if (!last) {
            <div
              [class.bg-indigo-600]="i < currentStep()"
              [class.bg-gray-200]="i >= currentStep()"
              class="h-0.5 w-12 sm:w-20 mx-1 transition-colors">
            </div>
          }
        </div>
      }
    </nav>
  `
})
export class ProgressStepperComponent {
  readonly steps = input<ProgressStep[]>([]);
  readonly currentStep = input<number>(0);
}
