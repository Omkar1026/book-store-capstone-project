import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyFormatPipe } from '../../../pipes/currency-format.pipe';

export interface OrderSummaryData {
  subtotal: number;
  shipping: number;
  giftPointsDiscount: number;
  total: number;
}

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  template: `
    <div class="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-3">
      <h3 class="text-base font-semibold text-gray-900 mb-4">Order Summary</h3>

      <div class="flex justify-between text-sm text-gray-600">
        <span>Subtotal</span>
        <span>{{ summary().subtotal | currencyFormat }}</span>
      </div>

      <div class="flex justify-between text-sm text-gray-600">
        <span>Shipping</span>
        @if (summary().shipping === 0) {
          <span class="text-green-600 font-medium">Free</span>
        } @else {
          <span>{{ summary().shipping | currencyFormat }}</span>
        }
      </div>

      @if (summary().giftPointsDiscount > 0) {
        <div class="flex justify-between text-sm text-green-600">
          <span>Gift Points</span>
          <span>−{{ summary().giftPointsDiscount | currencyFormat }}</span>
        </div>
      }

      <div class="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900">
        <span>Total</span>
        <span>{{ summary().total | currencyFormat }}</span>
      </div>
    </div>
  `
})
export class OrderSummaryComponent {
  readonly summary = input.required<OrderSummaryData>();
}
