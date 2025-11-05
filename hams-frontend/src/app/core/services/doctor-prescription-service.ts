import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Prescription } from '../../models/prescription-interface';
import { Patient } from '../../models/patient-interface';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DoctorPrescriptionService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getPrescriptionHistory(): Observable<Prescription[]> {
    return this.http
      .get<Prescription[]>(`${this.baseUrl}/doctors/me/prescriptions`)
      .pipe(catchError(() => of(this.getMockPrescriptions())));
  }

  getPatientList(): Observable<Patient[]> {
    return this.http
      .get<Patient[]>(`${this.baseUrl}/doctors/me/patients`)
      .pipe(catchError(() => of(this.getMockPatients())));
  }

  createPrescription(prescription: Partial<Prescription>): Observable<Prescription> {
    return this.http.post<Prescription>(`${this.baseUrl}/doctors/me/prescriptions`, prescription);
  }

  updatePrescription(prescription: Prescription): Observable<Prescription> {
    return this.http.put<Prescription>(
      `${this.baseUrl}/doctors/me/prescriptions/${prescription.id}`,
      prescription
    );
  }

  deletePrescription(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/doctors/me/prescriptions/${id}`);
  }

  private getMockPrescriptions(): Prescription[] {
    return [
      {
        id: 101,
        patientId: 1,
        patientName: 'Alice Johnson',
        date: new Date('2025-10-10'),
        diagnosis: 'Viral Infection',
        medications: [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            instructions: 'Twice daily after meals',
            durationDays: 5,
          },
        ],
        status: 'Sent',
      },
      {
        id: 102,
        patientId: 2,
        patientName: 'Bob Smith',
        date: new Date('2025-10-14'),
        diagnosis: 'Headache and fever',
        medications: [
          {
            name: 'Ibuprofen',
            dosage: '400mg',
            instructions: 'As needed for pain',
            durationDays: 3,
          },
        ],
        status: 'Draft',
      },
    ];
  }

  private getMockPatients(): Patient[] {
    return [
      {
        patientId: 1,
        name: 'Alice Johnson',
        email: 'alice@email.com',
        contactNumber: '+1-555-0101',
        address: '123 Main St',
        gender: 'Female',
        dateOfBirth: '1989-03-15',
        bloodGroup: 'O+',
      },
      {
        patientId: 2,
        name: 'Bob Smith',
        email: 'bob@email.com',
        contactNumber: '+1-555-0102',
        address: '123 Main St',
        gender: 'Male',
        dateOfBirth: '1990-01-01',
        bloodGroup: 'A+',
      },
      {
        patientId: 3,
        name: 'Charlie Doe',
        email: 'charlie@email.com',
        contactNumber: '+1-555-0103',
        address: '123 Main St',
        gender: 'Male',
        dateOfBirth: '1990-01-01',
        bloodGroup: 'A+',
      },
    ];
  }
}
