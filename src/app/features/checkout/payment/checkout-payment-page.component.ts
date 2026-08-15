import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { delay, of } from 'rxjs';

import { AuthStore } from '../../../core/store/auth.store';
import { CheckoutStore } from '../../../core/store/checkout.store';
import { CartStore } from '../../../core/store/cart.store';
import { GiftPointsStore } from '../../../core/store/gift-points.store';

import { PaymentMethod } from '../../../core/models/payment.model';

import { ProgressStepperComponent, ProgressStep } from '../../../shared/components/ui/progress-stepper/progress-stepper.component';
import { PaymentMethodSelectorComponent } from '../../../shared/components/domain/payment-method-selector/payment-method-selector.component';
import { GiftPointsRedeemComponent } from '../../../shared/components/domain/gift-points-redeem/gift-points-redeem.component';
import { OrderSummaryComponent, OrderSummaryData } from '../../../shared/components/domain/order-summary/order-summary.component';
const CHECKOUT_STEPS: ProgressStep[] = [
  { label: 'Address' },
  { label: 'Payment' },
  { label: 'Confirmation' }
];

// Mock payment methods available on the payment page
const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm-card', userId: '', type: 'credit_card', last4: '4242', isDefault: true },
  { id: 'pm-paypal', userId: '', type: 'paypal', isDefault: false }
];

@Component({
  selector: 'app-checkout-payment-page',
  standalone: true,
  imports: [
    CommonModule,
    ProgressStepperComponent,
    PaymentMethodSelectorComponent,
    GiftPointsRedeemComponent,
    OrderSummaryComponent
  ],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <app-progress-stepper [steps]="steps" [currentStep]="1" />

      <h1 class="text-2xl font-bold text-gray-900 mb-6">Payment</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Left: payment options -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Back link -->
          <button
            type="button"
            (click)="goBack()"
            class="text-sm text-indigo-600 hover:underline font-medium">
            ← Change address
          </button>

          <!-- Payment method selector -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5">
            <app-payment-method-selector
              [methods]="paymentMethods()"
              [selectedId]="selectedMethodId()"
              (select)="onSelectMethod($event)"
            />
          </div>

          <!-- Gift points redemption -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5">
            <app-gift-points-redeem
              [balance]="giftPointsStore.balance()"
              [appliedPoints]="giftPointsStore.pendingRedemption()"
              (redeem)="onRedeem($event)"
            />
          </div>

          <!-- Error message -->
          @if (paymentError()) {
            <p class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {{ paymentError() }}
            </p>
          }

          <!-- Place order button -->
          <button
            type="button"
            (click)="onPlaceOrder()"
            [disabled]="!selectedMethodId() || isProcessing()"
            class="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base">
            @if (isProcessing()) {
              Processing…
            } @else {
              Place Order
            }
          </button>

        </div>

        <!-- Right: order summary -->
        <div>
          <app-order-summary [summary]="orderSummary()" />
        </div>

      </div>
    </div>
  `
})
export class CheckoutPaymentPageComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  readonly checkoutStore = inject(CheckoutStore);
  readonly cartStore = inject(CartStore);
  readonly giftPointsStore = inject(GiftPointsStore);
  private readonly router = inject(Router);

  readonly steps = CHECKOUT_STEPS;
  readonly paymentMethods = signal<PaymentMethod[]>(MOCK_PAYMENT_METHODS);
  readonly selectedMethodId = signal<string | null>(
    this.checkoutStore.paymentMethod()?.id ?? MOCK_PAYMENT_METHODS[0].id
  );
  readonly isProcessing = signal(false);
  readonly paymentError = signal<string | null>(null);

  readonly orderSummary = computed<OrderSummaryData>(() => {
    const subtotal = this.cartStore.totalPrice();
    const shipping = subtotal > 0 && subtotal < 35 ? 4.99 : 0;
    const giftPointsDiscount = this.giftPointsStore.pendingRedemption() / 100;
    return {
      subtotal,
      shipping,
      giftPointsDiscount,
      total: Math.max(0, subtotal + shipping - giftPointsDiscount)
    };
  });

  ngOnInit(): void {
    // Redirect back if no address selected
    if (!this.checkoutStore.selectedAddress()) {
      this.router.navigate(['/checkout/address']);
      return;
    }
    const user = this.authStore.currentUser();
    if (user) {
      this.giftPointsStore.loadBalance(user.id);
    }
  }

  onSelectMethod(id: string): void {
    this.selectedMethodId.set(id);
    const method = this.paymentMethods().find(m => m.id === id) ?? null;
    if (method) this.checkoutStore.setPaymentMethod(method);
  }

  onRedeem(points: number): void {
    this.giftPointsStore.setRedemption(points);
    this.checkoutStore.setGiftPoints(points);
  }

  goBack(): void {
    this.router.navigate(['/checkout/address']);
  }

  onPlaceOrder(): void {
    if (!this.selectedMethodId() || this.isProcessing()) return;

    const method = this.paymentMethods().find(m => m.id === this.selectedMethodId());
    if (method) this.checkoutStore.setPaymentMethod(method);
    this.checkoutStore.setGiftPoints(this.giftPointsStore.pendingRedemption());

    this.isProcessing.set(true);
    this.paymentError.set(null);

    // Simulate 1.5s mock payment network delay then navigate to confirmation
    of(true).pipe(delay(1500)).subscribe(() => {
      this.isProcessing.set(false);
      this.router.navigate(['/checkout/confirmation']);
    });
  }
}
