import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthStore } from '../../../core/store/auth.store';
import { CheckoutStore } from '../../../core/store/checkout.store';
import { AddressService } from '../../../core/services/address.service';
import { Address } from '../../../core/models/address.model';

import { ProgressStepperComponent, ProgressStep } from '../../../shared/components/ui/progress-stepper/progress-stepper.component';
import { AddressCardComponent } from '../../../shared/components/domain/address-card/address-card.component';
import { InputComponent } from '../../../shared/components/ui/input/input.component';
import { SpinnerComponent } from '../../../shared/components/ui/spinner/spinner.component';

interface AddressForm {
  name: FormControl<string>;
  line1: FormControl<string>;
  line2: FormControl<string>;
  city: FormControl<string>;
  state: FormControl<string>;
  postcode: FormControl<string>;
  country: FormControl<string>;
}

const CHECKOUT_STEPS: ProgressStep[] = [
  { label: 'Address' },
  { label: 'Payment' },
  { label: 'Confirmation' }
];

@Component({
  selector: 'app-checkout-address-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProgressStepperComponent,
    AddressCardComponent,
    InputComponent,
    SpinnerComponent
  ],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <app-progress-stepper [steps]="steps" [currentStep]="0" />

      <h1 class="text-2xl font-bold text-gray-900 mb-6">Delivery Address</h1>

      @if (isLoading()) {
        <app-spinner [center]="true" size="lg" />
      } @else {

        <!-- Saved addresses -->
        @if (addresses().length > 0) {
          <section class="mb-8">
            <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Saved Addresses</h2>
            <div class="space-y-3">
              @for (addr of addresses(); track addr.id) {
                <app-address-card
                  [address]="addr"
                  [selected]="selectedAddressId() === addr.id"
                  [selectable]="true"
                  (select)="onSelectAddress($event)"
                />
              }
            </div>
          </section>
        }

        <!-- Add new address toggle -->
        <div class="mb-4">
          <button
            type="button"
            (click)="toggleNewForm()"
            class="text-sm text-indigo-600 font-medium hover:underline">
            {{ showNewForm() ? '− Cancel' : '+ Add a new address' }}
          </button>
        </div>

        <!-- New address form -->
        @if (showNewForm()) {
          <form [formGroup]="form" (ngSubmit)="onSubmitNew()" novalidate
            class="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 mb-6">
            <h2 class="text-base font-semibold text-gray-900 mb-2">New Address</h2>

            <app-input label="Full name" [required]="true" [control]="form.controls.name">
              <input
                formControlName="name"
                type="text"
                placeholder="Alex Johnson"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </app-input>

            <app-input label="Address line 1" [required]="true" [control]="form.controls.line1">
              <input
                formControlName="line1"
                type="text"
                placeholder="123 Main St"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </app-input>

            <app-input label="Address line 2" [control]="form.controls.line2">
              <input
                formControlName="line2"
                type="text"
                placeholder="Apt, suite, etc. (optional)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </app-input>

            <div class="grid grid-cols-2 gap-4">
              <app-input label="City" [required]="true" [control]="form.controls.city">
                <input
                  formControlName="city"
                  type="text"
                  placeholder="New York"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </app-input>

              <app-input label="State / Province" [required]="true" [control]="form.controls.state">
                <input
                  formControlName="state"
                  type="text"
                  placeholder="NY"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </app-input>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <app-input label="Postcode / ZIP" [required]="true" [control]="form.controls.postcode">
                <input
                  formControlName="postcode"
                  type="text"
                  placeholder="10001"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </app-input>

              <app-input label="Country" [required]="true" [control]="form.controls.country">
                <input
                  formControlName="country"
                  type="text"
                  placeholder="United States"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </app-input>
            </div>

            <button
              type="submit"
              class="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm">
              Use this address
            </button>
          </form>
        }

        <!-- Continue button -->
        @if (!showNewForm()) {
          <button
            type="button"
            (click)="onContinue()"
            [disabled]="!selectedAddressId()"
            class="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base">
            Continue to Payment
          </button>
        }
      }
    </div>
  `
})
export class CheckoutAddressPageComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly checkoutStore = inject(CheckoutStore);
  private readonly addressService = inject(AddressService);
  private readonly router = inject(Router);

  readonly steps = CHECKOUT_STEPS;
  readonly addresses = signal<Address[]>([]);
  readonly isLoading = signal(false);
  readonly showNewForm = signal(false);
  readonly selectedAddressId = signal<string | null>(
    this.checkoutStore.selectedAddress()?.id ?? null
  );

  readonly form = new FormGroup<AddressForm>({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    line1: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    line2: new FormControl('', { nonNullable: true }),
    city: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    state: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    postcode: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    country: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  ngOnInit(): void {
    const user = this.authStore.currentUser();
    if (!user) return;

    this.isLoading.set(true);
    this.addressService.getAddressesByUserId(user.id).subscribe({
      next: addrs => {
        this.addresses.set(addrs);
        this.isLoading.set(false);
        // Pre-select default or first address if nothing already selected
        if (!this.selectedAddressId()) {
          const def = addrs.find(a => a.isDefault) ?? addrs[0] ?? null;
          if (def) this.selectedAddressId.set(def.id);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSelectAddress(id: string): void {
    this.selectedAddressId.set(id);
  }

  toggleNewForm(): void {
    this.showNewForm.set(!this.showNewForm());
  }

  onSubmitNew(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const user = this.authStore.currentUser();
    if (!user) return;
    const v = this.form.getRawValue();
    const newAddress: Address = {
      id: `addr-new-${Date.now()}`,
      userId: user.id,
      name: v.name,
      line1: v.line1,
      line2: v.line2 || undefined,
      city: v.city,
      state: v.state,
      postcode: v.postcode,
      country: v.country,
      isDefault: false
    };
    this.checkoutStore.setAddress(newAddress);
    this.router.navigate(['/checkout/payment']);
  }

  onContinue(): void {
    const id = this.selectedAddressId();
    if (!id) return;
    const addr = this.addresses().find(a => a.id === id);
    if (!addr) return;
    this.checkoutStore.setAddress(addr);
    this.router.navigate(['/checkout/payment']);
  }
}
