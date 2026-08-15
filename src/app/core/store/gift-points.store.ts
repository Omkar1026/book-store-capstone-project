import { inject } from '@angular/core';
import { signalStore, withState, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { patchState } from '@ngrx/signals';
import { GiftPointsService } from '../services/gift-points.service';

interface GiftPointsState {
  balance: number;
  pendingRedemption: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: GiftPointsState = {
  balance: 0,
  pendingRedemption: 0,
  isLoading: false,
  error: null
};

export const GiftPointsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, giftPointsService = inject(GiftPointsService)) => ({
    loadBalance: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(userId =>
          giftPointsService.getGiftPointsBalance(userId).pipe(
            tap(balances => {
              const balance = balances[0]?.balance ?? 0;
              patchState(store, { balance, isLoading: false });
            }),
            catchError(err => {
              patchState(store, { isLoading: false, error: err?.error?.message ?? 'Failed to load gift points balance' });
              return EMPTY;
            })
          )
        )
      )
    ),

    setRedemption(amount: number): void {
      const capped = Math.min(amount, store.balance());
      patchState(store, { pendingRedemption: capped });
    }
  }))
);
