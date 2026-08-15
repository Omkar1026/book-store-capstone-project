import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpinnerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div role="status" [class]="containerClass">
      <svg
        [class]="svgClass"
        class="animate-spin text-indigo-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      <span class="sr-only">Loading…</span>
    </div>
  `
})
export class SpinnerComponent {
  readonly size = input<SpinnerSize>('md');
  readonly center = input<boolean>(false);

  get svgClass(): string {
    const sizes: Record<SpinnerSize, string> = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
    return sizes[this.size()];
  }

  get containerClass(): string {
    return this.center() ? 'flex justify-center items-center py-12' : 'inline-flex';
  }
}
