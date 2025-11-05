// patient-auth.service.ts - FIXED VERSION
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import {
  AuthPatientLogin,
  AuthPatientRequest,
  AuthPatientResponse,
} from '../../models/auth-patient-interface';
import { environment } from '../../environments/environment';
import { redirectBasedOnRole } from '../../models/redirectBasedOnRole';
import { JwtService } from './jwt-service';

@Injectable({
  providedIn: 'root',
})
export class PatientAuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private jwtService = inject(JwtService);
  private apiUrlForRegistration = environment.apiUrl + environment.auth.register;
  private apiUrlForLogin = environment.apiUrl + environment.auth.login;
  private tokenKey = 'authPatientToken';
  private patientKey = 'patientData';
  private userRoleKey = 'userRole';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  private userRoleSubject = new BehaviorSubject<string>(this.getUserRole());

  register(registerRequest: AuthPatientRequest): Observable<any> {
    return this.http
      .post<AuthPatientResponse>(`${this.apiUrlForRegistration}`, registerRequest, {
        responseType: 'text' as 'json',
      })
      .pipe(
        tap((response) => {
          this.setRegisteredPatient(response, 'PATIENT');
        })
      );
  }

  login(loginRequest: AuthPatientLogin): Observable<AuthPatientResponse> {
    return this.http.post<AuthPatientResponse>(`${this.apiUrlForLogin}`, loginRequest).pipe(
      tap((response) => {
        this.clearOtherAuthData(); // Clear other roles first
        const role = 'PATIENT'; // Assuming your patient response structure
        this.setAuthData(response, role);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.patientKey);
    localStorage.removeItem(this.userRoleKey);
    this.userRoleSubject.next('');
    this.router.navigate(['/auth/login']);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentPatient(): AuthPatientResponse | null {
    const patientData = localStorage.getItem(this.patientKey);
    return patientData ? (JSON.parse(patientData) as AuthPatientResponse) : null;
  }

  getUserRole(): string {
    return localStorage.getItem(this.userRoleKey) || '';
  }

  isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  getCurrentUserRole(): Observable<string> {
    return this.userRoleSubject.asObservable();
  }

  private clearOtherAuthData(): void {
    // Clear doctor and admin data
    localStorage.removeItem('authDoctorToken');
    localStorage.removeItem('doctorData');
    localStorage.removeItem('authAdminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('userRole'); // Clear generic role storage
  }

  private setRegisteredPatient(data: AuthPatientResponse, role: string): void {
    localStorage.setItem(this.patientKey, JSON.stringify(data));
    localStorage.setItem(this.userRoleKey, role);
    this.isAuthenticatedSubject.next(true);
  }

  private setAuthData(response: AuthPatientResponse, role: string): void {
    console.log('🔄 PatientAuthService.setAuthData called');

    // Get role from JWT token
    const tokenRole = this.jwtService.getTokenRole(response.token);
    console.log('🎯 JWT Token Role:', tokenRole);

    // Use the role from JWT token, fallback to provided role
    const actualRole = tokenRole || role;
    console.log('🎯 Actual Role to store:', actualRole);

    // Normalize the role
    const normalizedRole = this.normalizeRole(actualRole);
    console.log('🎯 Normalized Role:', normalizedRole);

    // Validate it's a patient role
    const validPatientRoles = ['PATIENT', 'ROLE_PATIENT'];
    if (!validPatientRoles.includes(normalizedRole)) {
      console.error('❌ Invalid patient role:', normalizedRole);
      throw new Error(`Invalid patient role: ${normalizedRole}`);
    }

    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userRoleKey, normalizedRole);
    localStorage.setItem(this.patientKey, JSON.stringify(response));

    console.log('💾 Stored in localStorage:');
    console.log(
      '   - Token:',
      response.token ? `${response.token.substring(0, 30)}...` : 'NO TOKEN'
    );
    console.log('   - Patient Data:', !!response.patient);
    console.log('   - User Role:', normalizedRole);

    this.isAuthenticatedSubject.next(true);
    this.userRoleSubject.next(normalizedRole);
    // redirectBasedOnRole(this.router, normalizedRole);
  }

  private normalizeRole(role: string): string {
    if (role && role.startsWith('ROLE_')) {
      return role.replace('ROLE_', '');
    }
    return role;
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  canAccess(requiredRole: string): boolean {
    const userRole = this.getUserRole();
    return userRole === requiredRole;
  }

  // In patient-auth.service.ts - SIMPLIFY VALIDATION
  validateCurrentToken(): boolean {
    const token = this.getToken();
    const storedPatient = this.getCurrentPatient();
    const storedRole = this.getUserRole();

    return !!(token && storedPatient && storedRole === 'PATIENT');
  }
}
