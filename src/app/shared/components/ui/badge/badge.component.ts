import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeColor = 'indigo' | 'red' | 'green' | 'yellow' | 'gray';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses" class="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-bold leading-none">
      {{ count() > 99 ? '99+' : count() }}
    </span>
  `
})
export class BadgeComponent {
  readonly count = input<number>(0);
  readonly color = input<BadgeColor>('red');

  get badgeClasses(): string {
    const colors: Record<BadgeColor, string> = {
      indigo: 'bg-indigo-600 text-white',
      red: 'bg-red-500 text-white',
      green: 'bg-green-500 text-white',
      yellow: 'bg-yellow-400 text-gray-900',
      gray: 'bg-gray-200 text-gray-700'
    };
    return colors[this.color()];
  }
}
