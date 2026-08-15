import { Component, inject, OnInit, effect } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { AuthStore } from '../../../core/store/auth.store';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { InputComponent } from '../../../shared/components/ui/input/input.component';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

        <!-- Logo / Title -->
        <div class="text-center mb-8">
          <span class="text-3xl">📚</span>
          <h1 class="text-2xl font-bold text-gray-900 mt-2">Sign in to BookStore</h1>
          <p class="text-sm text-gray-500 mt-1">Welcome back!</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-5">

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
          <app-input label="Password" [required]="true" [control]="form.controls.password">
            <input
              formControlName="password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
            <span class="w-full text-center">Sign In</span>
          </app-button>

        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Don't have an account?
          <a routerLink="/auth/register" class="text-indigo-600 font-medium hover:underline ml-1">Create one</a>
        </p>

      </div>
    </div>
  `
})
export class LoginPageComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);

  readonly form = new FormGroup<LoginForm>({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] })
  });

  constructor() {
    // Navigate away on successful login
    effect(() => {
      if (this.authStore.isAuthenticated() && !this.authStore.isLoading()) {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/home';
        this.router.navigateByUrl(returnUrl);
      }
    });
  }

  ngOnInit(): void {
    this.title.setTitle('Sign In — BookStore');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.authStore.login({ email, password });
  }
}
