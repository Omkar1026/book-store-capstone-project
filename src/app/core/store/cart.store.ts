import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { patchState } from '@ngrx/signals';
import { CartService } from '../services/cart.service';
import { ToastStore } from './toast.store';
import { Cart, CartItem } from '../models/cart.model';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

// If a user token exists in storage the cart will be fetched immediately on
// app init. Start isLoading=true so the cart page never flashes the empty-state
// before the first response arrives.
const initialState: CartState = {
  cart: null,
  isLoading: !!localStorage.getItem('token'),
  error: null
};

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ cart }) => ({
    items: computed(() => cart()?.items ?? []),
    itemCount: computed(() => (cart()?.items ?? []).reduce((sum, item) => sum + item.quantity, 0)),
    totalPrice: computed(() =>
      (cart()?.items ?? []).reduce((sum, item) => sum + item.price * item.quantity, 0)
    )
  })),
  withMethods((store, cartService = inject(CartService), toastStore = inject(ToastStore)) => ({
    loadCart: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(userId =>
          cartService.getCartByUserId(userId).pipe(
            switchMap(carts => {
              if (carts.length > 0) {
                patchState(store, { cart: carts[0], isLoading: false });
                return EMPTY;
              }
              // No cart exists yet — create one for this user
              const newCart: Cart = {
                id: `cart-${Date.now()}`,
                userId,
                items: [],
                updatedAt: new Date().toISOString()
              };
              return cartService.createCart(newCart).pipe(
                tap(created => patchState(store, { cart: created, isLoading: false })),
                catchError(() => {
                  // createCart failed — still unblock the UI with an empty in-memory cart
                  patchState(store, { cart: newCart, isLoading: false });
                  return EMPTY;
                })
              );
            }),
            catchError(err => {
              patchState(store, { isLoading: false, error: err?.error?.message ?? 'Failed to load cart' });
              return EMPTY;
            })
          )
        )
      )
    ),

    addItem(item: CartItem): void {
      const current = store.cart();
      if (!current) return;

      const existing = current.items.find(i => i.bookId === item.bookId);
      let updatedItems: CartItem[];

      if (existing) {
        updatedItems = current.items.map(i =>
          i.bookId === item.bookId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        updatedItems = [...current.items, item];
      }

      const updatedCart: Cart = { ...current, items: updatedItems, updatedAt: new Date().toISOString() };
      patchState(store, { cart: updatedCart });

      const msg = existing
        ? `"${item.title}" quantity updated in cart`
        : `"${item.title}" added to cart`;
      toastStore.add({ type: 'success', message: msg });

      cartService.updateCart(current.id, { items: updatedItems, updatedAt: updatedCart.updatedAt }).pipe(
        catchError(() => EMPTY)
      ).subscribe();
    },

    updateQty(bookId: string, quantity: number): void {
      const current = store.cart();
      if (!current) return;

      const updatedItems = quantity <= 0
        ? current.items.filter(i => i.bookId !== bookId)
        : current.items.map(i => i.bookId === bookId ? { ...i, quantity } : i);

      const updatedCart: Cart = { ...current, items: updatedItems, updatedAt: new Date().toISOString() };
      patchState(store, { cart: updatedCart });

      cartService.updateCart(current.id, { items: updatedItems, updatedAt: updatedCart.updatedAt }).pipe(
        catchError(() => EMPTY)
      ).subscribe();
    },

    removeItem(bookId: string): void {
      const current = store.cart();
      if (!current) return;

      const updatedItems = current.items.filter(i => i.bookId !== bookId);
      const updatedCart: Cart = { ...current, items: updatedItems, updatedAt: new Date().toISOString() };
      patchState(store, { cart: updatedCart });

      cartService.updateCart(current.id, { items: updatedItems, updatedAt: updatedCart.updatedAt }).pipe(
        catchError(() => EMPTY)
      ).subscribe();
    },

    clearCart(): void {
      const current = store.cart();
      if (!current) return;

      const updatedCart: Cart = { ...current, items: [], updatedAt: new Date().toISOString() };
      patchState(store, { cart: updatedCart });

      cartService.updateCart(current.id, { items: [], updatedAt: updatedCart.updatedAt }).pipe(
        catchError(() => EMPTY)
      ).subscribe();
    },

    /** Wipes in-memory cart state (called on logout so the next user starts clean). */
    resetCart(): void {
      patchState(store, { cart: null, isLoading: false, error: null });
    }
  }))
);
