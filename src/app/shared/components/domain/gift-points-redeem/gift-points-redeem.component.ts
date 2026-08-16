import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyFormatPipe } from '../../../pipes/currency-format.pipe';

@Component({
  selector: 'app-gift-points-redeem',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyFormatPipe],
  template: `
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-lg">&#127873;</span>
        <h4 class="text-sm font-semibold text-gray-900">Gift Points</h4>
        <span class="ml-auto text-sm text-amber-700 font-medium">Balance: {{ balance() }} pts</span>
      </div>

      @if (balance() > 0) {
        <div class="flex gap-2">
          <input
            type="number"
            [(ngModel)]="pointsToRedeem"
            [max]="balance()"
            min="0"
            placeholder="Points to redeem"
            class="flex-1 border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          />
          <button
            (click)="applyPoints()"
            [disabled]="!pointsToRedeem || pointsToRedeem <= 0"
            class="bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors">
            Apply
          </button>
        </div>
        @if (appliedPoints() > 0) {
          <div class="mt-2 flex items-center justify-between text-xs text-green-700">
            <span>{{ appliedPoints() }} points applied ({{ appliedDiscount | currencyFormat }} off)</span>
            <button (click)="redeem.emit(0)" class="text-red-500 hover:underline">Remove</button>
          </div>
        }
      } @else {
        <p class="text-sm text-gray-500">You have no gift points to redeem.</p>
      }
    </div>
  `
})
export class GiftPointsRedeemComponent {
  readonly balance = input<number>(0);
  readonly appliedPoints = input<number>(0);
  readonly redeem = output<number>();

  pointsToRedeem: number | null = null;

  get appliedDiscount(): number {
    return this.appliedPoints() / 100;
  }

  applyPoints(): void {
    if (this.pointsToRedeem && this.pointsToRedeem > 0) {
      this.redeem.emit(Math.min(this.pointsToRedeem, this.balance()));
    }
  }
}
