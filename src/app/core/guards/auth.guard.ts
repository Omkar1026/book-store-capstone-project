import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * AuthGuard — protects routes that require authentication.
 * Redirects unauthenticated users to /auth/login.
 * Full implementation in Sub-Task 4 (AuthStore integration).
 */
export const authGuard: CanActivateFn = () => {
  // Placeholder: always allow until AuthStore is implemented in Sub-Task 4
  return true;
};
