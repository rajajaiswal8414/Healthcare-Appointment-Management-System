import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PatientAuthService } from '../../core/services/patient-auth-service';
import { DoctorAuthService } from '../../core/services/doctor-auth-service';
import { AdminAuthService } from '../../core/services/admin-auth-service';
import { redirectBasedOnRole } from '../../models/redirectBasedOnRole';

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  private patientAuthService = inject(PatientAuthService);
  private doctorAuthService = inject(DoctorAuthService);
  private adminAuthService = inject(AdminAuthService);

  private router = inject(Router);
  isAuthenticated = false;
  userRole: string | null = null; // Store the determined role

  ngOnInit() {
    // Check authentication status on component initialization
    this.checkAuthStatus();
  }

  /**
   * Checks which service has an active session and sets the role/status.
   * This logic assumes each service has a similar method (like getCurrentPatient)
   * that returns data if authenticated, or null otherwise.
   */
  checkAuthStatus(): void {
    const patientData = this.patientAuthService.getUserRole();
    const doctorData = this.doctorAuthService.getUserRole();
    const adminData = this.adminAuthService.getUserRole();

    if (patientData) {
      this.isAuthenticated = true;
      this.userRole = 'PATIENT';
    } else if (doctorData) {
      this.isAuthenticated = true;
      this.userRole = 'DOCTOR';
    } else if (adminData) {
      this.isAuthenticated = true;
      this.userRole = 'ADMIN';
    } else {
      this.isAuthenticated = false;
      this.userRole = null;
    }
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  navigateToDashboard() {
    // 1. Ensure we have a role. Re-check if necessary.
    if (!this.userRole) {
      this.checkAuthStatus();
      if (!this.userRole) {
        // If still not authenticated, send to login
        this.router.navigate(['/auth/login']);
        return;
      }
    }

    // 2. Use the imported, shared utility function for role-based navigation
    redirectBasedOnRole(this.router, this.userRole);
  }
}
