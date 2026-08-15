import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { AuthStore } from '../../../core/store/auth.store';
import { AuthService } from '../../../core/services/auth.service';

import { InputComponent } from '../../../shared/components/ui/input/input.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent
  ],
  template: `
    <div class="max-w-lg mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div class="bg-white border border-gray-200 rounded-2xl p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">

          <app-input label="Full Name" [required]="true" [control]="form.controls.name">
            <input
              id="name"
              type="text"
              formControlName="name"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Your name"
            />
          </app-input>

          <app-input label="Email Address" [required]="true" [control]="form.controls.email">
            <input
              id="email"
              type="email"
              formControlName="email"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
            />
          </app-input>

          @if (successMessage()) {
            <p class="text-sm text-green-600 font-medium">{{ successMessage() }}</p>
          }

          @if (errorMessage()) {
            <p class="text-sm text-red-600 font-medium">{{ errorMessage() }}</p>
          }

          <app-button
            type="submit"
            variant="primary"
            [loading]="saving()"
            [disabled]="form.invalid">
            Save Changes
          </app-button>

        </form>
      </div>
    </div>
  `
})
export class ProfilePageComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly title = inject(Title);

  readonly saving = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] })
  });

  ngOnInit(): void {
    this.title.setTitle('My Profile — BookStore');
    const user = this.authStore.currentUser();
    if (user) {
      this.form.patchValue({ name: user.name, email: user.email });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const userId = this.authStore.currentUser()?.id;
    if (!userId) return;

    this.saving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const { name, email } = this.form.getRawValue();
    this.authService.updateProfile(userId, { name, email }).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Profile updated successfully.');
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('Failed to update profile. Please try again.');
      }
    });
  }
}
