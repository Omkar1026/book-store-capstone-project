import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // ── Auth (publicly accessible, guestGuard prevents re-login) ───────────
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login-page.component').then(
            (m) => m.LoginPageComponent
          )
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register-page.component').then(
            (m) => m.RegisterPageComponent
          )
      }
    ]
  },

  // ── Home (public) ───────────────────────────────────────────────────────
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home-page.component').then(
        (m) => m.HomePageComponent
      )
  },

  // ── Catalogue (public) ──────────────────────────────────────────────────
  {
    path: 'catalogue',
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './features/catalogue/catalogue-page/catalogue-page.component'
          ).then((m) => m.CataloguePageComponent)
      },
      {
        path: 'publisher/:id',
        loadComponent: () =>
          import(
            './features/catalogue/publisher-page/publisher-page.component'
          ).then((m) => m.PublisherPageComponent)
      },
      {
        path: ':category',
        loadComponent: () =>
          import(
            './features/catalogue/category-page/category-page.component'
          ).then((m) => m.CategoryPageComponent)
      }
    ]
  },

  // ── Product detail (public) ─────────────────────────────────────────────
  {
    path: 'products/:id',
    loadComponent: () =>
      import(
        './features/product-detail/product-detail-page.component'
      ).then((m) => m.ProductDetailPageComponent)
  },

  // ── Cart (public) ───────────────────────────────────────────────────────
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart-page.component').then(
        (m) => m.CartPageComponent
      )
  },

  // ── Checkout (requires auth) ────────────────────────────────────────────
  {
    path: 'checkout',
    canActivate: [authGuard],
    children: [
      {
        path: 'address',
        loadComponent: () =>
          import(
            './features/checkout/address/checkout-address-page.component'
          ).then((m) => m.CheckoutAddressPageComponent)
      },
      {
        path: 'payment',
        loadComponent: () =>
          import(
            './features/checkout/payment/checkout-payment-page.component'
          ).then((m) => m.CheckoutPaymentPageComponent)
      },
      {
        path: 'confirmation',
        loadComponent: () =>
          import(
            './features/checkout/confirmation/checkout-confirmation-page.component'
          ).then((m) => m.CheckoutConfirmationPageComponent)
      }
    ]
  },

  // ── Account (requires auth) ─────────────────────────────────────────────
  {
    path: 'account',
    canActivate: [authGuard],
    children: [
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/account/profile/profile-page.component').then(
            (m) => m.ProfilePageComponent
          )
      },
      {
        path: 'orders',
        loadComponent: () =>
          import(
            './features/account/order-history/order-history-page.component'
          ).then((m) => m.OrderHistoryPageComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import(
            './features/account/order-detail/order-detail-page.component'
          ).then((m) => m.OrderDetailPageComponent)
      }
    ]
  },

  // ── 404 fallback ────────────────────────────────────────────────────────
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found-page.component').then(
        (m) => m.NotFoundPageComponent
      )
  }
];
