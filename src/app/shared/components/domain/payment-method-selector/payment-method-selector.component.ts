import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentMethod, PaymentMethodType } from '../../../../core/models/payment.model';

@Component({
  selector: 'app-payment-method-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3">
      <h3 class="text-sm font-semibold text-gray-800 mb-2">Payment Method</h3>

      @for (method of methods(); track method.id) {
        <label
          class="flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors"
          [class.border-indigo-500]="selectedId() === method.id"
          [class.bg-indigo-50]="selectedId() === method.id"
          [class.border-gray-200]="selectedId() !== method.id">
          <input
            type="radio"
            [name]="'payment-method'"
            [value]="method.id"
            [checked]="selectedId() === method.id"
            (change)="select.emit(method.id)"
            class="accent-indigo-600"
          />
          <span class="text-xl">{{ methodIcon(method.type) }}</span>
          <span class="flex-1 text-sm text-gray-700">{{ methodLabel(method) }}</span>
          @if (method.isDefault) {
            <span class="text-xs text-indigo-600 font-medium bg-indigo-100 px-2 py-0.5 rounded-full">Default</span>
          }
        </label>
      }

      @if (methods().length === 0) {
        <p class="text-sm text-gray-400 text-center py-4">No saved payment methods.</p>
      }
    </div>
  `
})
export class PaymentMethodSelectorComponent {
  readonly methods = input<PaymentMethod[]>([]);
  readonly selectedId = input<string | null>(null);
  readonly select = output<string>();

  methodIcon(type: PaymentMethodType): string {
    const icons: Record<PaymentMethodType, string> = {
      credit_card: '💳',
      debit_card: '💳',
      paypal: '🅿️',
      gift_card: '🎁'
    };
    return icons[type];
  }

  methodLabel(method: PaymentMethod): string {
    if (method.type === 'paypal') return 'PayPal';
    if (method.type === 'gift_card') return 'Gift Card';
    const label = method.type === 'credit_card' ? 'Credit Card' : 'Debit Card';
    return method.last4 ? `${label} ending in ${method.last4}` : label;
  }
}
