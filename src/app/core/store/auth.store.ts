import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { patchState } from '@ngrx/signals';
import { AuthService } from '../services/auth.service';
import { User, LoginRequest, RegisterRequest } from '../models/user.model';

interface AuthState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  currentUser: null,
  isLoading: false,
  error: null
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ currentUser }) => ({
    isAuthenticated: computed(() => currentUser() !== null)
  })),
  withMethods((store, authService = inject(AuthService)) => ({
    hydrate(): void {
      const user = authService.getCurrentUser();
      patchState(store, { currentUser: user });
    },

    login: rxMethod<LoginRequest>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(credentials =>
          authService.login(credentials).pipe(
            tap(res => patchState(store, { currentUser: res.user, isLoading: false, error: null })),
            catchError(err => {
              patchState(store, { isLoading: false, error: err?.error?.message ?? 'Login failed' });
              return EMPTY;
            })
          )
        )
      )
    ),

    register: rxMethod<RegisterRequest>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(details =>
          authService.register(details).pipe(
            tap(res => patchState(store, { currentUser: res.user, isLoading: false, error: null })),
            catchError(err => {
              patchState(store, { isLoading: false, error: err?.error?.message ?? 'Registration failed' });
              return EMPTY;
            })
          )
        )
      )
    ),

    logout(): void {
      authService.logout();
      patchState(store, { currentUser: null, error: null });
    }
  })),
  withHooks({
    onInit(store) {
      store.hydrate();
    }
  })
);
