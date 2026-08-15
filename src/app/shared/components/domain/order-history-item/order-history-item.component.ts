import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Order } from '../../../../core/models/order.model';
import { CurrencyFormatPipe } from '../../../pipes/currency-format.pipe';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';

@Component({
  selector: 'app-order-history-item',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyFormatPipe, TimeAgoPipe],
  template: `
    <div class="bg-white rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <!-- Order info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-sm font-semibold text-gray-900">Order #{{ order().id | slice:0:8 }}</span>
          <span [class]="statusClass" class="text-xs font-medium px-2 py-0.5 rounded-full">
            {{ order().status | titlecase }}
          </span>
        </div>
        <p class="text-xs text-gray-500 mt-1">{{ order().placedAt | timeAgo }}</p>
        <p class="text-xs text-gray-500">{{ order().items.length }} item(s)</p>
      </div>

      <!-- Total -->
      <div class="text-right shrink-0">
        <p class="text-base font-bold text-gray-900">{{ order().totalAmount | currencyFormat }}</p>
        <a
          [routerLink]="['/account/orders', order().id]"
          class="text-xs text-indigo-600 hover:underline mt-1 block">
          View Details →
        </a>
      </div>
    </div>
  `
})
export class OrderHistoryItemComponent {
  readonly order = input.required<Order>();

  get statusClass(): string {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return map[this.order().status] ?? 'bg-gray-100 text-gray-700';
  }
}
