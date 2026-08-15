import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthStore } from '../../../core/store/auth.store';
import { OrderStore } from '../../../core/store/order.store';

import { OrderHistoryItemComponent } from '../../../shared/components/domain/order-history-item/order-history-item.component';
import { SpinnerComponent } from '../../../shared/components/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/components/ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/ui/error-state/error-state.component';

@Component({
  selector: 'app-order-history-page',
  standalone: true,
  imports: [
    OrderHistoryItemComponent,
    SpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent
  ],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      @if (orderStore.isLoading()) {
        <app-spinner [center]="true" size="lg" />
      } @else if (orderStore.error()) {
        <app-error-state
          [message]="orderStore.error()!"
          retryLabel="Retry"
          (retry)="loadOrders()"
        />
      } @else if (orderStore.orders().length === 0) {
        <app-empty-state
          icon="📦"
          title="No orders yet"
          message="You haven't placed any orders. Start shopping to see your orders here."
          actionLabel="Browse Catalogue"
          (action)="router.navigate(['/catalogue'])"
        />
      } @else {
        <div class="space-y-4">
          @for (order of sortedOrders(); track order.id) {
            <app-order-history-item [order]="order" />
          }
        </div>
      }
    </div>
  `
})
export class OrderHistoryPageComponent implements OnInit {
  readonly orderStore = inject(OrderStore);
  private readonly authStore = inject(AuthStore);
  readonly router = inject(Router);

  sortedOrders() {
    return [...this.orderStore.orders()].sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
    );
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const userId = this.authStore.currentUser()?.id;
    if (userId) {
      this.orderStore.loadOrders(userId);
    }
  }
}
