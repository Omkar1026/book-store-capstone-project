import {
  Component,
  computed,
  inject,
  OnDestroy,
  output,
  signal
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
          <a routerLink="/home" class="flex items-center gap-2 text-indigo-600 font-bold text-xl shrink-0">
            <span>📚</span>
            <span>BookStore</span>
          </a>

          <!-- Search bar — hidden on mobile -->
          <div class="flex-1 max-w-lg mx-6 hidden sm:block">
            <div class="relative">
              <input
                type="search"
                placeholder="Search books, authors…"
                aria-label="Search books and authors"
                (input)="onSearch($event)"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span class="absolute left-3 top-2.5 text-gray-400 text-sm" aria-hidden="true">🔍</span>
            </div>
          </div>

          <!-- Right: cart + user (desktop) + hamburger (mobile) -->
          <div class="flex items-center gap-3">

            <!-- Cart -->
            <a
              routerLink="/cart"
              class="relative text-gray-600 hover:text-indigo-600 p-1"
              aria-label="Shopping cart">
              <span class="text-xl" aria-hidden="true">🛒</span>
              @if (cartCount() > 0) {
                <app-badge [count]="cartCount()" class="absolute -top-2 -right-2" />
              }
            </a>

            <!-- User menu — hidden on mobile, shown on sm+ -->
            @if (isLoggedIn()) {
              <div class="hidden sm:flex items-center gap-2">
                <span class="text-sm text-gray-700 hidden md:block">{{ userName() }}</span>

                <!-- Account dropdown -->
                <div class="relative group">
                  <button class="text-sm text-gray-600 hover:text-indigo-600 flex items-center gap-1">
                    Account
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div class="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg
                              opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                    <a
                      routerLink="/account/orders"
                      class="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 rounded-t-lg">
                      My Orders
                    </a>
                    <a
                      routerLink="/account/profile"
                      class="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 rounded-b-lg">
                      Profile
                    </a>
                  </div>
                </div>

                <button
                  (click)="onLogout()"
                  aria-label="Log out"
                  class="text-sm text-red-500 hover:text-red-700 ml-1">
                  Logout
                </button>
              </div>
            } @else {
              <a routerLink="/auth/login" class="hidden sm:inline text-sm text-indigo-600 font-medium hover:underline">
                Sign In
              </a>
            }

            <!-- Hamburger — visible on mobile only -->
            <button
              (click)="mobileMenuOpen.set(!mobileMenuOpen())"
              class="sm:hidden p-2 text-gray-600 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg"
              [attr.aria-label]="mobileMenuOpen() ? 'Close menu' : 'Open menu'"
              [attr.aria-expanded]="mobileMenuOpen()">
              @if (mobileMenuOpen()) {
                <!-- X icon -->
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              } @else {
                <!-- Hamburger icon -->
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              }
            </button>
          </div>
        </div>

        <!-- Mobile search row -->
        <div class="sm:hidden pb-3">
          <div class="relative">
            <input
              type="search"
              placeholder="Search books, authors…"
              aria-label="Search books and authors"
              (input)="onSearch($event)"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span class="absolute left-3 top-2.5 text-gray-400 text-sm" aria-hidden="true">🔍</span>
          </div>
        </div>
      </div>

      <!-- Mobile nav drawer -->
      @if (mobileMenuOpen()) {
        <nav
          class="sm:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3"
          aria-label="Mobile navigation">
          <a
            routerLink="/home"
            (click)="mobileMenuOpen.set(false)"
            class="block text-sm font-medium text-gray-700 hover:text-indigo-600 py-1">
            Home
          </a>
          <a
            routerLink="/catalogue"
            (click)="mobileMenuOpen.set(false)"
            class="block text-sm font-medium text-gray-700 hover:text-indigo-600 py-1">
            Catalogue
          </a>

          @if (isLoggedIn()) {
            <a
              routerLink="/account/orders"
              (click)="mobileMenuOpen.set(false)"
              class="block text-sm font-medium text-gray-700 hover:text-indigo-600 py-1">
              My Orders
            </a>
            <a
              routerLink="/account/profile"
              (click)="mobileMenuOpen.set(false)"
              class="block text-sm font-medium text-gray-700 hover:text-indigo-600 py-1">
              Account ({{ userName() }})
            </a>
            <button
              (click)="onLogout(); mobileMenuOpen.set(false)"
              class="block w-full text-left text-sm font-medium text-red-500 hover:text-red-700 py-1">
              Logout
            </button>
          } @else {
            <a
              routerLink="/auth/login"
              (click)="mobileMenuOpen.set(false)"
              class="block text-sm font-medium text-indigo-600 hover:underline py-1">
              Sign In
            </a>
            <a
              routerLink="/auth/register"
              (click)="mobileMenuOpen.set(false)"
              class="block text-sm font-medium text-indigo-600 hover:underline py-1">
              Create Account
            </a>
          }
        </nav>
      }
    </header>
  `
})
export class HeaderComponent implements OnDestroy {
  private readonly authStore = inject(AuthStore);
  private readonly cartStore = inject(CartStore);
  private readonly router = inject(Router);

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  readonly logout = output<void>();
  readonly mobileMenuOpen = signal(false);

  readonly isLoggedIn = computed(() => !!this.authStore.currentUser());
  readonly userName = computed(() => this.authStore.currentUser()?.name ?? '');
  readonly cartCount = computed(() =>
    this.cartStore.items().reduce((sum, i) => sum + i.quantity, 0)
  );

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.trim();
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.router.navigate(['/catalogue'], {
        queryParams: { q: query || null },
        queryParamsHandling: 'merge'
      });
    }, 300);
  }

  ngOnDestroy(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  onLogout(): void {
    this.authStore.logout();
    this.logout.emit();
  }
}
