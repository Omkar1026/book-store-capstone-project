import {
  Component,
  computed,
  inject,
  input,
  output
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../ui/badge/badge.component';
import { AuthStore } from '../../../../core/store/auth.store';
import { CartStore } from '../../../../core/store/cart.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent],
  template: `
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">

          <!-- Logo -->
          <a routerLink="/home" class="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <span>📚</span>
            <span>BookStore</span>
          </a>

          <!-- Search bar -->
          <div class="flex-1 max-w-lg mx-6 hidden sm:block">
            <div class="relative">
              <input
                type="search"
                placeholder="Search books, authors…"
                (input)="onSearch($event)"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span class="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
            </div>
          </div>

          <!-- Right actions -->
          <nav class="flex items-center gap-4">
            <!-- Cart -->
            <a routerLink="/cart" class="relative text-gray-600 hover:text-indigo-600">
              <span class="text-xl">🛒</span>
              @if (cartCount() > 0) {
                <app-badge [count]="cartCount()" class="absolute -top-2 -right-2" />
              }
            </a>

            <!-- User menu -->
            @if (isLoggedIn()) {
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-700 hidden sm:block">{{ userName() }}</span>
                <a routerLink="/account/profile" class="text-sm text-gray-600 hover:text-indigo-600">Account</a>
                <button
                  (click)="onLogout()"
                  class="text-sm text-red-500 hover:text-red-700 ml-1">
                  Logout
                </button>
              </div>
            } @else {
              <a routerLink="/auth/login" class="text-sm text-indigo-600 font-medium hover:underline">Sign In</a>
            }
          </nav>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  private readonly authStore = inject(AuthStore);
  private readonly cartStore = inject(CartStore);

  readonly logout = output<void>();

  readonly isLoggedIn = computed(() => !!this.authStore.currentUser());
  readonly userName = computed(() => this.authStore.currentUser()?.name ?? '');
  readonly cartCount = computed(() =>
    this.cartStore.items().reduce((sum, i) => sum + i.quantity, 0)
  );

  onSearch(event: Event): void {
    // Search handled by parent/router; emit if needed
  }

  onLogout(): void {
    this.authStore.logout();
    this.logout.emit();
  }
}
