// doctor-auth.service.ts - FIXED VERSION
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthDoctorLogin,
  AuthDoctorRequest,
  AuthDoctorResponse,
} from '../../models/auth-doctor-interface';
import { Router } from '@angular/router';
import { JwtService } from './jwt-service';

@Injectable({
  providedIn: 'root',
})
export class DoctorAuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private jwtService = inject(JwtService);
  private apiUrlForRegistration = environment.apiUrl + environment.admin.doctorRegister;
  private apiUrlForLogin = environment.apiUrl + environment.admin.doctorLogin;

  private tokenKey = 'authDoctorToken';
  private doctorKey = 'doctorData';
  private userRoleKey = 'userRole';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  private userRoleSubject = new BehaviorSubject<string>(this.getUserRole());

  register(registerRequest: AuthDoctorRequest): Observable<AuthDoctorResponse> {
    return this.http
      .post<AuthDoctorResponse>(`${this.apiUrlForRegistration}`, registerRequest, {
        responseType: 'text' as 'json',
      })
      .pipe(
        tap((response) => {
          this.setRegisteredDoctor(response, 'DOCTOR');
        })
      );
  }

  login(loginRequest: AuthDoctorLogin): Observable<AuthDoctorResponse> {
    return this.http.post<AuthDoctorResponse>(`${this.apiUrlForLogin}`, loginRequest).pipe(
      tap((response) => {
        this.clearOtherAuthData(); // Clear other roles first
        // Get role from response data if available, otherwise default to DOCTOR
        const role = 'DOCTOR'; // Assuming your doctor response has similar structure
        this.setAuthData(response, role);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.doctorKey);
    localStorage.removeItem(this.userRoleKey);
    this.userRoleSubject.next('');
    this.router.navigate(['/auth/login']);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentDoctor(): AuthDoctorResponse | null {
    const doctorData = localStorage.getItem(this.doctorKey);
    return doctorData ? (JSON.parse(doctorData) as AuthDoctorResponse) : null;
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
    // Clear patient and admin data
    localStorage.removeItem('authPatientToken');
    localStorage.removeItem('patientData');
    localStorage.removeItem('authAdminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('userRole'); // Clear generic role storage
  }

  private setRegisteredDoctor(data: AuthDoctorResponse, role: string): void {
    localStorage.setItem(this.doctorKey, JSON.stringify(data));
    localStorage.setItem(this.userRoleKey, role);
    this.isAuthenticatedSubject.next(true);
  }

  private setAuthData(response: AuthDoctorResponse, role: string): void {
    console.log('🔄 DoctorAuthService.setAuthData called');

    // Get role from JWT token
    const tokenRole = this.jwtService.getTokenRole(response.token);
    console.log('🎯 JWT Token Role:', tokenRole);

    // Use the role from JWT token, fallback to provided role
    const actualRole = tokenRole || role;
    console.log('🎯 Actual Role to store:', actualRole);

    // Normalize the role
    const normalizedRole = this.normalizeRole(actualRole);
    console.log('🎯 Normalized Role:', normalizedRole);

    // Validate it's a doctor role
    const validDoctorRoles = ['DOCTOR', 'ROLE_DOCTOR'];
    if (!validDoctorRoles.includes(normalizedRole)) {
      console.error('❌ Invalid doctor role:', normalizedRole);
      throw new Error(`Invalid doctor role: ${normalizedRole}`);
    }

    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userRoleKey, normalizedRole);
    localStorage.setItem(this.doctorKey, JSON.stringify(response));

    console.log('💾 Stored in localStorage:');
    console.log(
      '   - Token:',
      response.token ? `${response.token.substring(0, 30)}...` : 'NO TOKEN'
    );
    console.log('   - Doctor Data:', !!response.doctor);
    console.log('   - User Role:', normalizedRole);

    this.userRoleSubject.next(normalizedRole);
    this.isAuthenticatedSubject.next(true);
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

  // In doctor-auth.service.ts - SIMPLIFY VALIDATION
  validateCurrentToken(): boolean {
    const token = this.getToken();
    const storedDoctor = this.getCurrentDoctor();
    const storedRole = this.getUserRole();

    return !!(token && storedDoctor && storedRole === 'DOCTOR');
  }
}
