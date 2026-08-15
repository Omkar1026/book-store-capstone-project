import { Component, inject, OnInit, effect } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../../core/store/auth.store';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { InputComponent } from '../../../shared/components/ui/input/input.component';

interface RegisterForm {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

/** Validates that `password` and `confirmPassword` controls match. */
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value ?? '';
  const confirm = group.get('confirmPassword')?.value ?? '';
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

        <!-- Logo / Title -->
        <div class="text-center mb-8">
          <span class="text-3xl">📚</span>
          <h1 class="text-2xl font-bold text-gray-900 mt-2">Create your account</h1>
          <p class="text-sm text-gray-500 mt-1">Join BookStore today</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-5">

          <!-- Name -->
          <app-input label="Full name" [required]="true" [control]="form.controls.name">
            <input
              formControlName="name"
              type="text"
              autocomplete="name"
              placeholder="Jane Doe"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </app-input>

          <!-- Email -->
          <app-input label="Email address" [required]="true" [control]="form.controls.email">
            <input
              formControlName="email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </app-input>

          <!-- Password -->
          <app-input label="Password" [required]="true" [control]="form.controls.password" hint="At least 6 characters">
            <input
              formControlName="password"
              type="password"
              autocomplete="new-password"
              placeholder="••••••••"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </app-input>

          <!-- Confirm Password -->
          <app-input
            label="Confirm password"
            [required]="true"
            [control]="form.controls.confirmPassword">
            <input
              formControlName="confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="••••••••"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <!-- Password mismatch error rendered inline below the input -->
            @if (form.errors?.['passwordMismatch'] && form.controls.confirmPassword.touched) {
              <p class="text-xs text-red-500 mt-0.5">Passwords do not match.</p>
            }
          </app-input>

          <!-- Server error -->
          @if (authStore.error()) {
            <p class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {{ authStore.error() }}
            </p>
          }

          <!-- Submit -->
          <app-button
            type="submit"
            [loading]="authStore.isLoading()"
            [disabled]="form.invalid"
            size="lg"
            class="w-full block">
            <span class="w-full text-center">Create Account</span>
          </app-button>

        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Already have an account?
          <a routerLink="/auth/login" class="text-indigo-600 font-medium hover:underline ml-1">Sign in</a>
        </p>

      </div>
    </div>
  `
})
export class RegisterPageComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly form = new FormGroup<RegisterForm>(
    {
      name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
      email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    },
    { validators: passwordMatchValidator }
  );

  constructor() {
    // Navigate to home on successful registration
    effect(() => {
      if (this.authStore.isAuthenticated() && !this.authStore.isLoading()) {
        this.router.navigate(['/home']);
      }
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, email, password } = this.form.getRawValue();
    this.authStore.register({ name, email, password });
  }
}
