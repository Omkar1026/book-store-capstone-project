import { inject } from '@angular/core';
import { signalStore, withState, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { patchState } from '@ngrx/signals';
import { OrderService } from '../services/order.service';
import { Order } from '../models/order.model';

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null
};

export const OrderStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, orderService = inject(OrderService)) => ({
    loadOrders: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(userId =>
          orderService.getOrdersByUserId(userId).pipe(
            tap(orders => patchState(store, { orders, isLoading: false })),
            catchError(err => {
              patchState(store, { isLoading: false, error: err?.error?.message ?? 'Failed to load orders' });
              return EMPTY;
            })
          )
        )
      )
    ),

    loadOrder(orderId: string): void {
      const found = store.orders().find(o => o.id === orderId) ?? null;
      patchState(store, { selectedOrder: found });
    },

    placeOrder: rxMethod<Order>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(order =>
          orderService.createOrder(order).pipe(
            tap(created =>
              patchState(store, {
                orders: [...store.orders(), created],
                selectedOrder: created,
                isLoading: false
              })
            ),
            catchError(err => {
              patchState(store, { isLoading: false, error: err?.error?.message ?? 'Failed to place order' });
              return EMPTY;
            })
          )
        )
      )
    ),

    cancelOrder: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(orderId =>
          orderService.cancelOrder(orderId).pipe(
            tap(updated =>
              patchState(store, {
                orders: store.orders().map(o => (o.id === updated.id ? updated : o)),
                selectedOrder: store.selectedOrder()?.id === updated.id ? updated : store.selectedOrder(),
                isLoading: false
              })
            ),
            catchError(err => {
              patchState(store, { isLoading: false, error: err?.error?.message ?? 'Failed to cancel order' });
              return EMPTY;
            })
          )
        )
      )
    )
  }))
);
