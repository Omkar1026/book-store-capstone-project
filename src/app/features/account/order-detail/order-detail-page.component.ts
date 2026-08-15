import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { OrderStore } from '../../../core/store/order.store';
import { CartStore } from '../../../core/store/cart.store';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { CartItem } from '../../../core/models/cart.model';

import { CancelOrderDialogComponent } from '../../../shared/components/domain/cancel-order-dialog/cancel-order-dialog.component';
import { SpinnerComponent } from '../../../shared/components/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/components/ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/ui/error-state/error-state.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

const CANCELLABLE_STATUSES: OrderStatus[] = ['pending', 'processing'];

@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CancelOrderDialogComponent,
    SpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    CurrencyFormatPipe
  ],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <a routerLink="/account/orders" class="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        ← Back to Orders
      </a>

      @if (orderStore.isLoading()) {
        <app-spinner [center]="true" size="lg" />
      } @else if (orderStore.error()) {
        <app-error-state
          [message]="orderStore.error()!"
          retryLabel="Retry"
          (retry)="loadOrder()"
        />
      } @else if (!orderStore.selectedOrder()) {
        <app-empty-state
          icon="📦"
          title="Order not found"
          message="We couldn't find this order in your history."
          actionLabel="Back to Orders"
          (action)="router.navigate(['/account/orders'])"
        />
      } @else {
        @let order = orderStore.selectedOrder()!;

        <div class="space-y-6">

          <!-- Header -->
          <div class="bg-white border border-gray-200 rounded-2xl p-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 class="text-xl font-bold text-gray-900">
                  Order #{{ order.id | slice:0:8 }}
                </h1>
                <p class="text-sm text-gray-500 mt-1">
                  Placed on {{ order.placedAt | date:'longDate' }}
                </p>
              </div>
              <span [class]="statusClass(order.status)"
                class="text-sm font-semibold px-3 py-1 rounded-full self-start sm:self-auto">
                {{ order.status | titlecase }}
              </span>
            </div>
          </div>

          <!-- Items -->
          <div class="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-4">Items</h2>
            <div class="space-y-4">
              @for (item of order.items; track item.bookId) {
                <div class="flex gap-3 items-center">
                  <img
                    [src]="item.imageUrl || 'assets/placeholder-book.png'"
                    [alt]="item.title"
                    class="w-12 h-16 object-cover rounded bg-gray-100 shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ item.title }}</p>
                    <p class="text-xs text-gray-500">{{ item.author }}</p>
                    <p class="text-xs text-gray-500">Qty: {{ item.quantity }}</p>
                  </div>
                  <span class="text-sm font-semibold text-gray-900 shrink-0">
                    {{ (item.price * item.quantity) | currencyFormat }}
                  </span>
                </div>
              }
            </div>

            <!-- Total -->
            <div class="border-t border-gray-200 mt-4 pt-4 flex justify-between">
              <span class="font-semibold text-gray-700">Total</span>
              <span class="font-bold text-gray-900 text-lg">{{ order.totalAmount | currencyFormat }}</span>
            </div>
          </div>

          <!-- Delivery Address -->
          <div class="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-3">Delivery Address</h2>
            <div class="text-sm text-gray-600 space-y-0.5">
              <p class="font-medium text-gray-800">{{ order.deliveryAddress.name }}</p>
              <p>{{ order.deliveryAddress.line1 }}</p>
              @if (order.deliveryAddress.line2) {
                <p>{{ order.deliveryAddress.line2 }}</p>
              }
              <p>
                {{ order.deliveryAddress.city }},
                {{ order.deliveryAddress.state }}
                {{ order.deliveryAddress.postcode }}
              </p>
              <p>{{ order.deliveryAddress.country }}</p>
            </div>
          </div>

          <!-- Payment & Delivery Info -->
          <div class="bg-white border border-gray-200 rounded-2xl p-6 grid sm:grid-cols-2 gap-6">
            <div>
              <h2 class="text-base font-semibold text-gray-900 mb-2">Payment Method</h2>
              <p class="text-sm text-gray-600 capitalize">{{ order.paymentMethod }}</p>
            </div>
            @if (order.deliveryInfo?.estimatedDate) {
              <div>
                <h2 class="text-base font-semibold text-gray-900 mb-2">Estimated Delivery</h2>
                <p class="text-sm text-gray-600">{{ order.deliveryInfo.estimatedDate | date:'longDate' }}</p>
                @if (order.deliveryInfo.trackingNumber) {
                  <p class="text-xs text-gray-500 mt-1">Tracking: {{ order.deliveryInfo.trackingNumber }}</p>
                }
              </div>
            }
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-3">
            <!-- Buy Again -->
            <button
              (click)="buyAgain(order)"
              class="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors text-sm">
              🔁 Buy Again
            </button>

            <!-- Cancel Order -->
            @if (canCancel(order)) {
              <button
                (click)="showCancelDialog.set(true)"
                class="flex-1 border border-red-300 text-red-600 font-semibold py-3 rounded-xl hover:bg-red-50 transition-colors text-sm">
                Cancel Order
              </button>
            }
          </div>

        </div>

        <!-- Cancel Dialog -->
        <app-cancel-order-dialog
          [isOpen]="showCancelDialog()"
          [orderId]="order.id"
          [loading]="orderStore.isLoading()"
          (confirm)="onCancelConfirm($event)"
          (cancel)="showCancelDialog.set(false)"
        />
      }
    </div>
  `
})
export class OrderDetailPageComponent implements OnInit {
  readonly orderStore = inject(OrderStore);
  private readonly cartStore = inject(CartStore);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly showCancelDialog = signal(false);

  ngOnInit(): void {
    this.loadOrder();
  }

  loadOrder(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderStore.loadOrder(id);
    }
  }

  canCancel(order: Order): boolean {
    const withinWindow = (Date.now() - new Date(order.placedAt).getTime()) < 48 * 60 * 60 * 1000;
    return withinWindow && CANCELLABLE_STATUSES.includes(order.status);
  }

  statusClass(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return map[status] ?? 'bg-gray-100 text-gray-700';
  }

  onCancelConfirm(orderId: string): void {
    this.orderStore.cancelOrder(orderId);
    this.showCancelDialog.set(false);
  }

  buyAgain(order: Order): void {
    for (const item of order.items) {
      const cartItem: CartItem = {
        bookId: item.bookId,
        title: item.title,
        author: item.author,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: item.quantity,
        stock: 99
      };
      this.cartStore.addItem(cartItem);
    }
    this.router.navigate(['/cart']);
  }
}
