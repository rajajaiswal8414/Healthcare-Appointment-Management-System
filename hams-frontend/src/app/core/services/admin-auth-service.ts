// admin-auth.service.ts - FIXED VERSION
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { redirectBasedOnRole } from '../../models/redirectBasedOnRole';
import { AuthAdminLogin, AuthAdminResponse } from '../../models/auth-admin-interface';
import { JwtService } from './jwt-service';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private jwtService = inject(JwtService);
  private apiUrlForLogin = environment.apiUrl + environment.admin.adminLogin;
  private tokenKey = 'authAdminToken';
  private adminKey = 'adminData';
  private userRoleKey = 'userRole';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  private userRoleSubject = new BehaviorSubject<string>(this.getUserRole());

  login(loginRequest: AuthAdminLogin): Observable<AuthAdminResponse> {
    return this.http.post<AuthAdminResponse>(`${this.apiUrlForLogin}`, loginRequest).pipe(
      tap((response) => {
        this.clearOtherAuthData(); // Clear other roles first
        // Get role from the response admin object, not from token
        const role = response.admin?.role || 'ADMIN';
        this.setAuthData(response, role);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.adminKey);
    localStorage.removeItem(this.userRoleKey);
    this.userRoleSubject.next('');
    this.router.navigate(['/auth/login']);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentAdmin(): AuthAdminResponse | null {
    const adminData = localStorage.getItem(this.adminKey);
    return adminData ? (JSON.parse(adminData) as AuthAdminResponse) : null;
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
    // Clear patient and doctor data
    localStorage.removeItem('authPatientToken');
    localStorage.removeItem('patientData');
    localStorage.removeItem('authDoctorToken');
    localStorage.removeItem('doctorData');
    localStorage.removeItem('userRole'); // Clear generic role storage
  }

  private setAuthData(response: AuthAdminResponse, role: string): void {
    console.log('🔄 AdminAuthService.setAuthData called');

    // Get role from JWT token (which has "roles" field)
    const tokenRole = this.jwtService.getTokenRole(response.token);
    console.log('🎯 JWT Token Role:', tokenRole);

    // Use the role from JWT token, fallback to response data, then default
    const actualRole = tokenRole || response.admin?.role || role;
    console.log('🎯 Actual Role to store:', actualRole);

    // Normalize the role - remove "ROLE_" prefix if present
    const normalizedRole = this.normalizeRole(actualRole);
    console.log('🎯 Normalized Role:', normalizedRole);

    // Validate it's an admin role
    const validAdminRoles = ['ADMIN', 'ROLE_ADMIN'];
    if (!validAdminRoles.includes(normalizedRole)) {
      console.error('❌ Invalid admin role:', normalizedRole);
      throw new Error(`Invalid admin role: ${normalizedRole}`);
    }

    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.adminKey, JSON.stringify(response));
    localStorage.setItem(this.userRoleKey, normalizedRole);

    console.log('💾 Stored in localStorage:');
    console.log(
      '   - Token:',
      response.token ? `${response.token.substring(0, 30)}...` : 'NO TOKEN'
    );
    console.log('   - Admin Data:', !!response.admin);
    console.log('   - User Role:', normalizedRole);

    this.isAuthenticatedSubject.next(true);
    this.userRoleSubject.next(normalizedRole);
    // redirectBasedOnRole(this.router, normalizedRole);
  }

  private normalizeRole(role: string): string {
    // Convert "ROLE_ADMIN" to "ADMIN", etc.
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

  // Validate that current session is actually for admin
  // In admin-auth.service.ts - SIMPLIFY VALIDATION
  validateCurrentToken(): boolean {
    const token = this.getToken();
    const storedAdmin = this.getCurrentAdmin();
    const storedRole = this.getUserRole();

    // Basic validation - if we have token, admin data, and correct role, consider it valid
    return !!(token && storedAdmin && storedRole === 'ADMIN');
  }
}
