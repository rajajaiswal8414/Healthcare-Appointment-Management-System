// services/admin.service.ts - REAL BACKEND CALLS
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdminAuthService } from './admin-auth-service';
import { AuthDoctorRequest } from '../../models/auth-doctor-interface';

export interface Doctor {
  // Support both field names - backend uses UUIDs for user IDs
  id?: number; // Optional for now
  doctorId: number; // Primary field

  doctorName: string;
  email: string;
  specialization: string;
  yearOfExperience: number;
  contactNumber: string;
  qualification: string;
  clinicAddress: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  userId?: string; // Changed to string for UUID
  username?: string;
}

export interface DoctorUpdateRequest {
  contactNumber: string;
  yearOfExperience: number;
  clinicAddress: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private adminAuthService = inject(AdminAuthService);
  private apiUrl = environment.apiUrl;

  private getAuthHeaders(): HttpHeaders {
    const token = this.adminAuthService.getToken();
    console.log('🔐 Auth token present:', !!token);
    console.log('🔐 Token preview:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  getDoctorId(doctor: Doctor): number {
    return doctor.doctorId ?? doctor.id ?? 0;
  }

  // Get user ID (UUID) for operations that need it
  getUserId(doctor: Doctor): string | null {
    return doctor.userId || null;
  }

  // Create doctor user with admin privileges
  createDoctor(doctorData: AuthDoctorRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/create-user`, doctorData, {
      headers: this.getAuthHeaders(),
      responseType: 'text' as 'json',
    });
  }

  // Update doctor details
  updateDoctor(doctorId: number, updateData: DoctorUpdateRequest): Observable<any> {
    // Validate doctorId
    if (!doctorId || isNaN(doctorId) || doctorId <= 0) {
      throw new Error('Invalid doctor ID');
    }

    return this.http.put(`${this.apiUrl}/admin/doctors/${doctorId}`, updateData, {
      headers: this.getAuthHeaders(),
    });
  }

  // Delete doctor
  deleteDoctor(doctorId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/doctors/${doctorId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getRecentDoctors(): Observable<Doctor[]> {
    const url = `${this.apiUrl}/admin/doctors/recent`;
    console.log('🔗 Making request to:', url);
    console.log('🔗 Full URL would be:', `${this.apiUrl}/admin/doctors/recent`);
    return this.http.get<Doctor[]>(url, {
      headers: this.getAuthHeaders(),
    });
  }

  getAllDoctors(): Observable<Doctor[]> {
    const url = `${this.apiUrl}/admin/doctors`;
    console.log('🔗 Making request to:', url);
    console.log('🔗 Full URL would be:', url);
    return this.http.get<Doctor[]>(url, {
      headers: this.getAuthHeaders(),
    });
  }

  // Test a simple endpoint to verify backend connectivity
  testBackendHealth(): Observable<any> {
    const url = `${this.apiUrl}/auth/login`; // Use a simple endpoint that should exist
    console.log('🔗 Testing backend health at:', url);
    return this.http.get(url, {
      headers: this.getAuthHeaders(),
    });
  }
}
