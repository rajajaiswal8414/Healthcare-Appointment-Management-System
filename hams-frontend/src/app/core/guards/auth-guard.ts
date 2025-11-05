import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthManagerService } from '../services/auth-manager-service';

export const authGuard: CanActivateFn = (route, state) => {
  const authManager = inject(AuthManagerService); // Add this
  const router = inject(Router);

  console.log('🔒 AuthGuard checking access to:', state.url);
  const userRole = authManager.getCurrentUserRole();
  console.log('🔒 Current user role:', userRole);

  if (!userRole) {
    console.log('🔒 No valid role found, redirecting to login');
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  const requiredRole = route.data['role'];

  if (requiredRole && userRole !== requiredRole) {
    console.warn(`User with role ${userRole} attempted to access ${requiredRole} route`);

    switch (userRole) {
      case 'PATIENT':
        router.navigate(['/patient/dashboard']);
        break;
      case 'DOCTOR':
        router.navigate(['/doctor/dashboard']);
        break;
      case 'ADMIN':
        router.navigate(['/admin/dashboard']);
        break;
      default:
        router.navigate(['/dashboard']);
    }
    return false;
  }

  return true;
};
