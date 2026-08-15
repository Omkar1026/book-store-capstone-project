import { CanActivateFn } from '@angular/router';

/**
 * GuestGuard — prevents already-authenticated users from visiting /auth/login.
 * Full implementation in Sub-Task 4 (AuthStore integration).
 */
export const guestGuard: CanActivateFn = () => {
  // Placeholder: always allow until AuthStore is implemented in Sub-Task 4
  return true;
};
