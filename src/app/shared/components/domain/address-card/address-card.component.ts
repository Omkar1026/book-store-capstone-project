import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Address } from '../../../../core/models/address.model';

@Component({
  selector: 'app-address-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="p-4 border rounded-xl transition-colors cursor-pointer"
      [class.border-indigo-500]="selected()"
      [class.bg-indigo-50]="selected()"
      [class.border-gray-200]="!selected()"
      (click)="select.emit(address().id)">

      <div class="flex items-start justify-between gap-2">
        <div class="flex-1 text-sm text-gray-700 space-y-0.5">
          <p class="font-semibold text-gray-900">{{ address().name }}</p>
          <p>{{ address().line1 }}</p>
          @if (address().line2) {
            <p>{{ address().line2 }}</p>
          }
          <p>{{ address().city }}, {{ address().state }} {{ address().postcode }}</p>
          <p>{{ address().country }}</p>
        </div>
        <div class="flex flex-col items-end gap-2 shrink-0">
          @if (address().isDefault) {
            <span class="text-xs text-indigo-600 font-medium bg-indigo-100 px-2 py-0.5 rounded-full">Default</span>
          }
          @if (selectable()) {
            <input
              type="radio"
              [checked]="selected()"
              (change)="select.emit(address().id)"
              class="accent-indigo-600 mt-1"
            />
          }
        </div>
      </div>

      @if (showActions()) {
        <div class="mt-3 flex gap-3 text-xs">
          <button (click)="edit.emit(address()); $event.stopPropagation()" class="text-indigo-600 hover:underline">Edit</button>
          @if (!address().isDefault) {
            <button (click)="remove.emit(address().id); $event.stopPropagation()" class="text-red-500 hover:underline">Remove</button>
          }
        </div>
      }
    </div>
  `
})
export class AddressCardComponent {
  readonly address = input.required<Address>();
  readonly selected = input<boolean>(false);
  readonly selectable = input<boolean>(false);
  readonly showActions = input<boolean>(false);

  readonly select = output<string>();
  readonly edit = output<Address>();
  readonly remove = output<string>();
}
