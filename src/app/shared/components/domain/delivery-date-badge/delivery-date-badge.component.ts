import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delivery-date-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
      <span class="text-green-600">🚚</span>
      <span class="text-green-700 font-medium">
        @if (estimatedDate()) {
          Estimated delivery: <span class="font-bold">{{ formattedDate }}</span>
        } @else {
          Delivery date TBC
        }
      </span>
    </div>
  `
})
export class DeliveryDateBadgeComponent {
  readonly estimatedDate = input<string | null>(null);

  get formattedDate(): string {
    const d = this.estimatedDate();
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
}
