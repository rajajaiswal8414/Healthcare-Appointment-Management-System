import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; // Removed 'of' and 'catchError'
import { MedicalRecordResponseDTO } from '../../models/medicalrecord-interface';
import { environment } from '../../environments/environment';

export interface MedicalRecordRequest {
  appointmentId: number;
  patientId: number;
  doctorId: number;
  reason: string;
  diagnosis: string;
  notes: string;
  prescriptions: Array<{
    medicationName: string;
    dosage: string;
    instructions: string;
  }>;
}

export interface MedicalRecordResponse {
  recordId: number;
  patientId: number;
  doctorId: number;
  patientName: string;
  doctorName: string;
  reason: string;
  diagnosis: string;
  notes: string;
  prescriptions: Array<{
    prescriptionId: number;
    medicationName: string;
    dosage: string;
    instructions: string;
    prescribedAt: string;
  }>;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class MedicalRecordService {
  private baseUrl = environment.apiUrl;
  // private useMockData = false; // Removed mock flag

  constructor(private http: HttpClient) {}

  getRecordsForPatient(): Observable<MedicalRecordResponseDTO[]> {
    return this.http.get<MedicalRecordResponseDTO[]>(`${this.baseUrl}/patients/me/medical-records`);
  }

  createMedicalRecord(record: MedicalRecordRequest): Observable<MedicalRecordResponse> {
    return this.http.post<MedicalRecordResponse>(
      `${this.baseUrl}/doctors/me/medical-records`,
      record
    );
  }
  getRecordsForDoctor(): Observable<MedicalRecordResponse[]> {
    return this.http.get<MedicalRecordResponse[]>(`${this.baseUrl}/doctors/me/medical-records`);
  }
  getPatientRecordsForDoctor(patientId: number): Observable<MedicalRecordResponse[]> {
    return this.http.get<MedicalRecordResponse[]>(
      `${this.baseUrl}/doctors/me/patients/${patientId}/medical-records`
    );
  }

  getRecordById(recordId: number): Observable<MedicalRecordResponse> {
    return this.http.get<MedicalRecordResponse>(`${this.baseUrl}/medical-records/${recordId}`);
  }

  getRecordsForCurrentDoctor(): Observable<MedicalRecordResponse[]> {
    return this.http.get<MedicalRecordResponse[]>(`${this.baseUrl}/doctors/me/medical-records`);
  }
}
