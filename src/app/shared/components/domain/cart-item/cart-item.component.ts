import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../../../core/models/cart.model';
import { CurrencyFormatPipe } from '../../../pipes/currency-format.pipe';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  template: `
    <div class="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      <!-- Book cover -->
      <img
        [src]="item().imageUrl || 'assets/placeholder-book.png'"
        [alt]="item().title"
        class="w-16 h-20 object-cover rounded-lg shrink-0 bg-gray-100"
      />

      <!-- Details -->
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-semibold text-gray-900 truncate">{{ item().title }}</h4>
        <p class="text-xs text-gray-500 mb-2">{{ item().author }}</p>
        <p class="text-sm font-bold text-gray-900">{{ item().price | currencyFormat }}</p>

        <!-- Qty stepper -->
        <div class="flex items-center gap-2 mt-2">
          <button
            (click)="decrement()"
            [disabled]="item().quantity <= 1"
            aria-label="Decrease quantity"
            class="w-7 h-7 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40">
            −
          </button>
          <span class="w-6 text-center text-sm font-medium" aria-live="polite">{{ item().quantity }}</span>
          <button
            (click)="increment()"
            [disabled]="item().quantity >= item().stock"
            aria-label="Increase quantity"
            class="w-7 h-7 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40">
            +
          </button>
        </div>
      </div>

      <!-- Line total + remove -->
      <div class="flex flex-col items-end gap-2 shrink-0">
        <span class="text-sm font-bold text-gray-900">
          {{ (item().price * item().quantity) | currencyFormat }}
        </span>
        <button
          (click)="remove.emit(item().bookId)"
          class="text-xs text-red-500 hover:text-red-700 transition-colors"
          [attr.aria-label]="'Remove ' + item().title + ' from cart'">
          Remove
        </button>
      </div>
    </div>
  `
})
export class CartItemComponent {
  readonly item = input.required<CartItem>();
  readonly remove = output<string>();
  readonly quantityChange = output<{ bookId: string; quantity: number }>();

  increment(): void {
    this.quantityChange.emit({ bookId: this.item().bookId, quantity: this.item().quantity + 1 });
  }

  decrement(): void {
    if (this.item().quantity > 1) {
      this.quantityChange.emit({ bookId: this.item().bookId, quantity: this.item().quantity - 1 });
    }
  }
}
