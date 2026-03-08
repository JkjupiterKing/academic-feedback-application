import { CanActivateFn, Router } from '@angular/router';

import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router); // Injecting the Router
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'; // Check authentication status

  if (isAuthenticated) {
    return true; // Allow access to the route
  } else {
    // Redirect to the authentication login route if not authenticated
    router.navigate(['/auth/login']);
    return false; // Block access to the route
  }
};

