import { Router } from '@angular/router';

/**
 * Redirects the user to the appropriate dashboard based on their role.
 * Uses { replaceUrl: true } to remove the current route (e.g., login page)
 * from the browser history, preventing navigation back after authentication.
 *
 * @param router The Angular Router instance (injected via inject(Router)).
 * @param role The role of the authenticated user ('PATIENT', 'DOCTOR', 'ADMIN').
 */
export function redirectBasedOnRole(router: Router, role: string): void {
  // Use replaceUrl: true for all successful post-login/redirect navigations
  const navigationOptions = { replaceUrl: true };

  switch (role) {
    case 'PATIENT':
      router.navigate(['/patient/dashboard'], navigationOptions);
      break;
    case 'DOCTOR':
      router.navigate(['/doctor/dashboard'], navigationOptions);
      break;
    case 'ADMIN':
      router.navigate(['/admin/dashboard'], navigationOptions);
      break;
    default:
      // Redirects to the generic '/dashboard' path, which your authGuard should handle
      router.navigate(['/dashboard'], navigationOptions);
      break;
  }
}
