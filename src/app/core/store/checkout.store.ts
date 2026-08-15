import { inject } from '@angular/core';
import { signalStore, withState, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { patchState } from '@ngrx/signals';
import { OrderService } from '../services/order.service';
import { Address } from '../models/address.model';
import { PaymentMethod } from '../models/payment.model';
import { Order } from '../models/order.model';

interface CheckoutState {
  selectedAddress: Address | null;
  paymentMethod: PaymentMethod | null;
  giftPointsToRedeem: number;
  placedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CheckoutState = {
  selectedAddress: null,
  paymentMethod: null,
  giftPointsToRedeem: 0,
  placedOrder: null,
  isLoading: false,
  error: null
};

export const CheckoutStore = signalStore(
  withState(initialState),
  withMethods((store, orderService = inject(OrderService)) => ({
    setAddress(address: Address): void {
      patchState(store, { selectedAddress: address });
    },

    setPaymentMethod(method: PaymentMethod): void {
      patchState(store, { paymentMethod: method });
    },

    setGiftPoints(points: number): void {
      patchState(store, { giftPointsToRedeem: points });
    },

    submitOrder: rxMethod<Order>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(order =>
          orderService.createOrder(order).pipe(
            tap(placed => patchState(store, { placedOrder: placed, isLoading: false })),
            catchError(err => {
              patchState(store, { isLoading: false, error: err?.error?.message ?? 'Failed to submit order' });
              return EMPTY;
            })
          )
        )
      )
    ),

    reset(): void {
      patchState(store, initialState);
    }
  }))
);
