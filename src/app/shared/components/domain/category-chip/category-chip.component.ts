import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="select.emit(categoryId())"
      [class.bg-indigo-600]="active()"
      [class.text-white]="active()"
      [class.border-indigo-600]="active()"
      [class.text-gray-700]="!active()"
      [class.bg-white]="!active()"
      class="inline-flex items-center px-4 py-1.5 rounded-full border text-sm font-medium transition-colors hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-700 whitespace-nowrap">
      {{ label() }}
    </button>
  `
})
export class CategoryChipComponent {
  readonly label = input.required<string>();
  readonly categoryId = input.required<string>();
  readonly active = input<boolean>(false);

  readonly select = output<string>();
}
