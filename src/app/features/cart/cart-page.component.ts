import { Component, computed, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CartStore } from '../../core/store/cart.store';

import { CartItemComponent } from '../../shared/components/domain/cart-item/cart-item.component';
import { OrderSummaryComponent, OrderSummaryData } from '../../shared/components/domain/order-summary/order-summary.component';
import { EmptyStateComponent } from '../../shared/components/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/components/ui/spinner/spinner.component';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    RouterLink,
    CartItemComponent,
    OrderSummaryComponent,
    EmptyStateComponent,
    SpinnerComponent
  ],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      @if (cartStore.isLoading()) {
        <app-spinner [center]="true" size="lg" />
      } @else if (cartStore.itemCount() === 0) {
        <app-empty-state
          icon="🛒"
          title="Your cart is empty"
          message="Looks like you haven't added any books yet."
          actionLabel="Browse Catalogue"
          (action)="goToCatalogue()"
        />
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Cart items list -->
          <div class="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5">
            <h2 class="text-base font-semibold text-gray-700 mb-2">
              {{ cartStore.itemCount() }} {{ cartStore.itemCount() === 1 ? 'item' : 'items' }}
            </h2>

            @for (item of cartStore.items(); track item.bookId) {
              <app-cart-item
                [item]="item"
                (quantityChange)="onQtyChange($event)"
                (remove)="onRemove($event)"
              />
            }
          </div>

          <!-- Sidebar -->
          <div class="flex flex-col gap-5">
            <app-order-summary [summary]="orderSummary()" />

            <button
              routerLink="/checkout/address"
              [disabled]="cartStore.itemCount() === 0"
              class="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base">
              Proceed to Checkout
            </button>

            <a
              routerLink="/catalogue"
              class="text-sm text-center text-indigo-600 hover:underline font-medium">
              ← Continue Shopping
            </a>
          </div>

        </div>
      }
    </div>
  `
})
export class CartPageComponent implements OnInit {
  readonly cartStore = inject(CartStore);
  private readonly router = inject(Router);

  readonly orderSummary = computed<OrderSummaryData>(() => {
    const subtotal = this.cartStore.totalPrice();
    const shipping = subtotal > 0 && subtotal < 35 ? 4.99 : 0;
    return {
      subtotal,
      shipping,
      giftPointsDiscount: 0,
      total: subtotal + shipping
    };
  });

  ngOnInit(): void {}

  onQtyChange(event: { bookId: string; quantity: number }): void {
    this.cartStore.updateQty(event.bookId, event.quantity);
  }

  onRemove(bookId: string): void {
    this.cartStore.removeItem(bookId);
  }

  goToCatalogue(): void {
    this.router.navigate(['/catalogue']);
  }
}
