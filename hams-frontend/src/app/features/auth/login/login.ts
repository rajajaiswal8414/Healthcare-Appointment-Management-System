// login.component.ts - IMPROVED VERSION
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PatientAuthService } from '../../../core/services/patient-auth-service';
import { AuthPatientLogin } from '../../../models/auth-patient-interface';
import { Observable } from 'rxjs';
import { DoctorAuthService } from '../../../core/services/doctor-auth-service';
import { AdminAuthService } from '../../../core/services/admin-auth-service';
import { AuthDoctorLogin } from '../../../models/auth-doctor-interface';
import { AuthAdminLogin } from '../../../models/auth-admin-interface';
import { AuthManagerService } from '../../../core/services/auth-manager-service';
import { toast } from 'ngx-sonner';

type LoginMode = 'patient' | 'doctor' | 'admin';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private patientAuthService = inject(PatientAuthService);
  private doctorAuthService = inject(DoctorAuthService);
  private adminAuthService = inject(AdminAuthService);
  private authManager = inject(AuthManagerService);
  private router = inject(Router);

  loginForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  loginMode: LoginMode = 'patient';

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    // Debug current state
    this.authManager.debugAuthState();

    // Check if user is already authenticated and redirect only if they're not on a protected route
    const currentRole = this.authManager.getCurrentUserRole();
    if (currentRole) {
      console.log('Already authenticated as:', currentRole);
      // Only redirect if we're not already on a dashboard route
      const currentUrl = this.router.url;
      console.log('Current URL:', currentUrl);

      if (
        !currentUrl.includes('/patient/dashboard') &&
        !currentUrl.includes('/doctor/dashboard') &&
        !currentUrl.includes('/admin/dashboard')
      ) {
        console.log('Redirecting to dashboard for role:', currentRole);
        this.redirectToRoleDashboard(currentRole);
      } else {
        console.log('Already on dashboard route, not redirecting');
      }
    } else {
      console.log('No valid authentication found');
    }
  }

  private redirectToRoleDashboard(role: string): void {
    switch (role) {
      case 'PATIENT':
        this.router.navigate(['/patient/dashboard']);
        break;
      case 'DOCTOR':
        this.router.navigate(['/doctor/dashboard']);
        break;
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  setLoginMode(mode: LoginMode): void {
    this.loginMode = mode;
    this.errorMessage = '';
    this.loginForm.reset();
  }

  showToastLogin() {
    toast.success('Welcome Back!', {
      description: 'You have successfully logged in.',
    });
  }

  showToastError() {
    toast.error('Something went wrong', {
      description: 'There was a problem with your request.',
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      console.log(`🔐 Attempting ${this.loginMode} login...`);

      // Clear any existing sessions before new login attempt
      this.authManager.prepareForLogin();

      const username = this.loginForm.value.username;
      const password = this.loginForm.value.password;

      let loginObservable: Observable<any>;

      switch (this.loginMode) {
        case 'patient':
          const patientRequest: AuthPatientLogin = { username, password };
          loginObservable = this.patientAuthService.login(patientRequest);
          break;
        case 'doctor':
          const doctorRequest: AuthDoctorLogin = { username, password };
          loginObservable = this.doctorAuthService.login(doctorRequest);
          break;
        case 'admin':
          const adminRequest: AuthAdminLogin = { username, password };
          loginObservable = this.adminAuthService.login(adminRequest);
          break;
        default:
          this.errorMessage = 'Invalid login mode';
          this.isLoading = false;
          return;
      }

      loginObservable.subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('✅ Login API call successful');

          // Wait a moment for localStorage to be updated, then check
          setTimeout(() => {
            console.log('🕒 Checking stored authentication data...');

            const actualRole = this.getStoredRoleForMode();
            console.log('🎯 Actual stored role:', actualRole);
            console.log('🎯 Expected role:', this.loginMode.toUpperCase());

            if (actualRole === this.loginMode.toUpperCase()) {
              console.log('✅ Role matches - redirecting to dashboard');
              // Use replaceUrl to prevent back navigation to login
              this.router.navigate([`/${this.loginMode}/dashboard`], { replaceUrl: true });
              this.showToastLogin();
            } else {
              this.errorMessage = `Authentication successful but role issue. Expected ${this.loginMode.toUpperCase()}, got ${actualRole}.`;
              console.error('❌ Role mismatch after login - clearing session');

              // Debug what's actually in localStorage
              this.debugLocalStorage();

              // Clear the invalid session
              this.authManager.prepareForLogin();
              this.showToastError();
            }
          }, 100);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Login API error:', error);
          this.handleLoginError(error);
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  // Add this helper method to debug localStorage
  private debugLocalStorage(): void {
    console.log('📦 Current localStorage auth data:');
    const authKeys = [
      'authPatientToken',
      'patientData',
      'authDoctorToken',
      'doctorData',
      'authAdminToken',
      'adminData',
      'userRole',
    ];
    authKeys.forEach((key) => {
      const value = localStorage.getItem(key);
      console.log(`   ${key}:`, value ? 'PRESENT' : 'ABSENT');
    });
  }

  private getStoredRoleForMode(): string | null {
    switch (this.loginMode) {
      case 'patient':
        return this.patientAuthService.getUserRole();
      case 'doctor':
        return this.doctorAuthService.getUserRole();
      case 'admin':
        return this.adminAuthService.getUserRole();
      default:
        return null;
    }
  }

  private handleLoginError(error: any): void {
    console.error('Login error:', error);

    if (error.status === 401) {
      this.errorMessage = 'Invalid username or password.';
    } else if (error.status === 403) {
      this.errorMessage = 'Access denied for this account type.';
    } else if (error.status === 0) {
      this.errorMessage = 'Network error. Please check your connection.';
    } else if (error.message) {
      this.errorMessage = error.message;
    } else {
      this.errorMessage = error.error?.message || `Login failed. Please try again.`;
    }
  }
}
