import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../ui/modal/modal.component';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-cancel-order-dialog',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      title="Cancel Order"
      (close)="cancel.emit()">

      <div slot="body" class="space-y-3">
        <p class="text-sm text-gray-700">
          Are you sure you want to cancel order
          <span class="font-semibold">#{{ orderId() | slice:0:8 }}</span>?
        </p>
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
          ⚠️ Cancellations are only allowed within <strong>48 hours</strong> of placing the order.
          Refunds are processed within 3–5 business days.
        </div>
      </div>

      <div slot="footer">
        <app-button variant="secondary" (click)="cancel.emit()">Keep Order</app-button>
        <app-button variant="danger" [loading]="loading()" (click)="confirm.emit(orderId())">
          Cancel Order
        </app-button>
      </div>
    </app-modal>
  `
})
export class CancelOrderDialogComponent {
  readonly isOpen = input<boolean>(false);
  readonly orderId = input<string>('');
  readonly loading = input<boolean>(false);

  readonly confirm = output<string>();
  readonly cancel = output<void>();
}
