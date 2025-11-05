// services/auth-manager.service.ts
import { Injectable, inject } from '@angular/core';
import { PatientAuthService } from './patient-auth-service';
import { DoctorAuthService } from './doctor-auth-service';
import { AdminAuthService } from './admin-auth-service';
import { JwtService } from './jwt-service';

@Injectable({
  providedIn: 'root',
})
export class AuthManagerService {
  private patientAuth = inject(PatientAuthService);
  private doctorAuth = inject(DoctorAuthService);
  private adminAuth = inject(AdminAuthService);
  private jwtService = inject(JwtService);

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    this.clearConflictingAuthData();
  }

  private clearConflictingAuthData(): void {
    const tokens = [
      { service: this.patientAuth, hasToken: !!this.patientAuth.getToken() },
      { service: this.doctorAuth, hasToken: !!this.doctorAuth.getToken() },
      { service: this.adminAuth, hasToken: !!this.adminAuth.getToken() },
    ];

    const activeTokens = tokens.filter((token) => token.hasToken);

    if (activeTokens.length > 1) {
      console.warn('Multiple auth tokens found. Clearing all for security.');
      this.clearAllAuthData();
    }
  }

  clearAllAuthData(): void {
    this.patientAuth.logout();
    this.doctorAuth.logout();
    this.adminAuth.logout();
  }

  getCurrentUserRole(): string | null {
    if (this.hasValidAdminSession()) return 'ADMIN';
    if (this.hasValidDoctorSession()) return 'DOCTOR';
    if (this.hasValidPatientSession()) return 'PATIENT';
    return null;
  }

  private hasValidAdminSession(): boolean {
    const token = this.adminAuth.getToken();
    const hasToken = !!token;
    const hasAdminData = !!this.adminAuth.getCurrentAdmin();
    const storedRole = this.adminAuth.getUserRole();

    // Check if token is expired
    if (hasToken && this.jwtService.isTokenExpired(token!)) {
      console.log('🔒 Admin token expired, clearing session');
      this.adminAuth.logout();
      return false;
    }

    return hasToken && hasAdminData && storedRole === 'ADMIN';
  }

  private hasValidDoctorSession(): boolean {
    const token = this.doctorAuth.getToken();
    const hasToken = !!token;
    const hasDoctorData = !!this.doctorAuth.getCurrentDoctor();
    const storedRole = this.doctorAuth.getUserRole();

    // Check if token is expired
    if (hasToken && this.jwtService.isTokenExpired(token!)) {
      console.log('🔒 Doctor token expired, clearing session');
      this.doctorAuth.logout();
      return false;
    }

    return hasToken && hasDoctorData && storedRole === 'DOCTOR';
  }

  private hasValidPatientSession(): boolean {
    const token = this.patientAuth.getToken();
    const hasToken = !!token;
    const hasPatientData = !!this.patientAuth.getCurrentPatient();
    const storedRole = this.patientAuth.getUserRole();

    // Check if token is expired
    if (hasToken && this.jwtService.isTokenExpired(token!)) {
      console.log('🔒 Patient token expired, clearing session');
      this.patientAuth.logout();
      return false;
    }

    return hasToken && hasPatientData && storedRole === 'PATIENT';
  }

  prepareForLogin(): void {
    this.clearAllAuthData();
  }

  debugAuthState(): void {
    console.log('=== AUTH MANAGER DEBUG ===');

    // Admin
    const adminToken = this.adminAuth.getToken();
    const adminData = this.adminAuth.getCurrentAdmin();
    const adminRole = this.adminAuth.getUserRole();
    console.log('ADMIN - Token:', !!adminToken, 'Data:', !!adminData, 'Role:', adminRole);

    // Doctor
    const doctorToken = this.doctorAuth.getToken();
    const doctorData = this.doctorAuth.getCurrentDoctor();
    const doctorRole = this.doctorAuth.getUserRole();
    console.log('DOCTOR - Token:', !!doctorToken, 'Data:', !!doctorData, 'Role:', doctorRole);

    // Patient
    const patientToken = this.patientAuth.getToken();
    const patientData = this.patientAuth.getCurrentPatient();
    const patientRole = this.patientAuth.getUserRole();
    console.log('PATIENT - Token:', !!patientToken, 'Data:', !!patientData, 'Role:', patientRole);

    console.log('Current Role:', this.getCurrentUserRole());
    console.log('========================');
  }
}
