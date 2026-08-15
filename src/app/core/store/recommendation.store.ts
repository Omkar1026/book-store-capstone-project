import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { patchState } from '@ngrx/signals';
import { RecommendationService } from '../services/recommendation.service';
import { Recommendation } from '../models/recommendation.model';

interface RecommendationState {
  recommended: Recommendation[];
  trending: Recommendation[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RecommendationState = {
  recommended: [],
  trending: [],
  isLoading: false,
  error: null
};

export const RecommendationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ recommended, trending }) => ({
    allRecommendations: computed(() => [...recommended(), ...trending()])
  })),
  withMethods((store, recommendationService = inject(RecommendationService)) => ({
    loadRecommendations: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(userId =>
          recommendationService.getRecommendationsByUserId(userId).pipe(
            tap(recs => {
              const trending = recs.filter(r => r.reason === 'trending');
              const recommended = recs.filter(r => r.reason !== 'trending');
              patchState(store, { recommended, trending, isLoading: false });
            }),
            catchError(err => {
              patchState(store, { isLoading: false, error: err?.error?.message ?? 'Failed to load recommendations' });
              return EMPTY;
            })
          )
        )
      )
    )
  }))
);
