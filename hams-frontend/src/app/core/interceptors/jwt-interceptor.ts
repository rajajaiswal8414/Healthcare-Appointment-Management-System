// jwt.interceptor.ts - FIXED VERSION
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { PatientAuthService } from '../services/patient-auth-service';
import { DoctorAuthService } from '../services/doctor-auth-service';
import { AdminAuthService } from '../services/admin-auth-service';
import { JwtService } from '../services/jwt-service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Check all auth services for tokens
  const patientAuth = inject(PatientAuthService);
  const doctorAuth = inject(DoctorAuthService);
  const adminAuth = inject(AdminAuthService);
  const jwtService = inject(JwtService);

  let token: string | null = null;
  let authService: any = null;

  // Check in order of specificity
  if (adminAuth.getToken()) {
    token = adminAuth.getToken();
    authService = adminAuth;
    console.log('🔐 Using Admin token for request');
  } else if (doctorAuth.getToken()) {
    token = doctorAuth.getToken();
    authService = doctorAuth;
    console.log('🔐 Using Doctor token for request');
  } else if (patientAuth.getToken()) {
    token = patientAuth.getToken();
    authService = patientAuth;
    console.log('🔐 Using Patient token for request');
  }

  // Check if token is expired before using it
  if (token && jwtService.isTokenExpired(token)) {
    console.log('🔒 Token expired, clearing session');
    authService?.logout();
    return next(req); // Continue without token
  }

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};
