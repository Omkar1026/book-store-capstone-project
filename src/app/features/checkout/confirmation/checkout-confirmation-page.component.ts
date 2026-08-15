import { Component, computed, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';

import { AuthStore } from '../../../core/store/auth.store';
import { CheckoutStore } from '../../../core/store/checkout.store';
import { CartStore } from '../../../core/store/cart.store';
import { OrderStore } from '../../../core/store/order.store';
import { GiftPointsStore } from '../../../core/store/gift-points.store';

import { Order, OrderItem } from '../../../core/models/order.model';

import { ProgressStepperComponent, ProgressStep } from '../../../shared/components/ui/progress-stepper/progress-stepper.component';
import { SpinnerComponent } from '../../../shared/components/ui/spinner/spinner.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

const CHECKOUT_STEPS: ProgressStep[] = [
  { label: 'Address' },
  { label: 'Payment' },
  { label: 'Confirmation' }
];

@Component({
  selector: 'app-checkout-confirmation-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProgressStepperComponent,
    SpinnerComponent,
    CurrencyFormatPipe
  ],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <app-progress-stepper [steps]="steps" [currentStep]="2" />

      @if (orderStore.isLoading()) {
        <app-spinner [center]="true" size="lg" />
      } @else if (orderStore.selectedOrder()) {

        <!-- Success banner -->
        <div class="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 text-center">
          <div class="text-4xl mb-2">✅</div>
          <h1 class="text-2xl font-bold text-green-800 mb-1">Order Confirmed!</h1>
          <p class="text-sm text-green-700">
            Order <span class="font-semibold">#{{ orderStore.selectedOrder()!.id }}</span> has been placed.
          </p>
        </div>

        <!-- Order details card -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">

          <!-- Delivery info -->
          <div>
            <h2 class="text-base font-semibold text-gray-900 mb-2">Delivery Address</h2>
            <div class="text-sm text-gray-600 space-y-0.5">
              <p class="font-medium text-gray-800">{{ orderStore.selectedOrder()!.deliveryAddress.name }}</p>
              <p>{{ orderStore.selectedOrder()!.deliveryAddress.line1 }}</p>
              @if (orderStore.selectedOrder()!.deliveryAddress.line2) {
                <p>{{ orderStore.selectedOrder()!.deliveryAddress.line2 }}</p>
              }
              <p>
                {{ orderStore.selectedOrder()!.deliveryAddress.city }},
                {{ orderStore.selectedOrder()!.deliveryAddress.state }}
                {{ orderStore.selectedOrder()!.deliveryAddress.postcode }}
              </p>
            </div>
          </div>

          <!-- Estimated delivery -->
          @if (orderStore.selectedOrder()!.deliveryInfo?.estimatedDate) {
            <div>
              <h2 class="text-base font-semibold text-gray-900 mb-1">Estimated Delivery</h2>
              <p class="text-sm text-gray-600">{{ orderStore.selectedOrder()!.deliveryInfo.estimatedDate | date:'longDate' }}</p>
            </div>
          }

          <!-- Items -->
          <div>
            <h2 class="text-base font-semibold text-gray-900 mb-3">Items Ordered</h2>
            <div class="space-y-3">
              @for (item of orderStore.selectedOrder()!.items; track item.bookId) {
                <div class="flex gap-3 items-center">
                  <img
                    [src]="item.imageUrl || 'assets/placeholder-book.png'"
                    [alt]="item.title"
                    class="w-10 h-14 object-cover rounded bg-gray-100 shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ item.title }}</p>
                    <p class="text-xs text-gray-500">{{ item.author }} × {{ item.quantity }}</p>
                  </div>
                  <span class="text-sm font-semibold text-gray-900 shrink-0">
                    {{ (item.price * item.quantity) | currencyFormat }}
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- Total paid -->
          <div class="border-t border-gray-200 pt-4 flex justify-between">
            <span class="font-semibold text-gray-900">Total Paid</span>
            <span class="font-bold text-gray-900 text-lg">
              {{ orderStore.selectedOrder()!.totalAmount | currencyFormat }}
            </span>
          </div>
        </div>

        <!-- CTA -->
        <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            routerLink="/catalogue"
            class="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors text-center text-base">
            Continue Shopping
          </a>
          <a
            routerLink="/account/orders"
            class="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors text-center text-base">
            View My Orders
          </a>
        </div>

      } @else if (orderError()) {
        <div class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p class="text-red-700 font-semibold mb-2">Something went wrong placing your order.</p>
          <p class="text-sm text-red-500 mb-4">{{ orderError() }}</p>
          <a routerLink="/checkout/payment" class="text-indigo-600 hover:underline text-sm font-medium">← Back to payment</a>
        </div>
      }
    </div>
  `
})
export class CheckoutConfirmationPageComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly checkoutStore = inject(CheckoutStore);
  private readonly cartStore = inject(CartStore);
  readonly orderStore = inject(OrderStore);
  private readonly giftPointsStore = inject(GiftPointsStore);
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  readonly steps = CHECKOUT_STEPS;
  readonly orderError = computed(() => this.orderStore.error());

  ngOnInit(): void {
    this.title.setTitle('Order Confirmed — BookStore');
    const address = this.checkoutStore.selectedAddress();
    const paymentMethod = this.checkoutStore.paymentMethod();
    const user = this.authStore.currentUser();

    // Guard: redirect home if arrived here without completing checkout
    if (!address || !paymentMethod || !user) {
      this.router.navigate(['/home']);
      return;
    }

    const cartItems = this.cartStore.items();
    const subtotal = this.cartStore.totalPrice();
    const shipping = subtotal > 0 && subtotal < 35 ? 4.99 : 0;
    const giftPointsUsed = this.checkoutStore.giftPointsToRedeem();
    const giftDiscount = giftPointsUsed / 100;
    const totalAmount = Math.max(0, subtotal + shipping - giftDiscount);

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + 5);

    const orderItems: OrderItem[] = cartItems.map(item => ({
      bookId: item.bookId,
      title: item.title,
      author: item.author,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity: item.quantity
    }));

    const order: Order = {
      id: `order-${Date.now()}`,
      userId: user.id,
      items: orderItems,
      status: 'processing',
      placedAt: new Date().toISOString(),
      deliveryAddress: address,
      paymentMethod: paymentMethod.type,
      giftPointsUsed,
      totalAmount,
      deliveryInfo: {
        estimatedDate: estimatedDate.toISOString()
      }
    };

    this.orderStore.placeOrder(order);
    this.cartStore.clearCart();
    this.checkoutStore.reset();
  }
}
