import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
// Import the interface from the feature component file
import { PatientWithStats } from 'src/app/features/doctor/patient-management/patient-management';

@Injectable({ providedIn: 'root' })
export class DoctorPatientService {
  private http = inject(HttpClient);

  // Assuming the Doctor's own patient list API is at this endpoint: /api/doctors/me/patients
  private patientsApiUrl = `${environment.apiUrl}/doctors/me/patients`;

  /**
   * Fetches the list of patients for the authenticated doctor.
   * Corresponds to GET /api/doctors/me/patients
   */
  getPatients(): Observable<PatientWithStats[]> {
    return this.http.get<PatientWithStats[]>(this.patientsApiUrl).pipe(
      catchError((error) => {
        console.error('Error fetching patients:', error);
        // Return an empty array on error to prevent component failure
        return of([]);
      })
    );
  }

  /**
   * Fetches specific medical records for a patient.
   * Assumed endpoint: GET /api/doctors/me/patients/{patientId}/medical-records
   */
  getPatientMedicalRecords(patientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.patientsApiUrl}/${patientId}/medical-records`);
  }

  /**
   * Performs client-side filtering (Note: Consider moving to server-side for performance)
   */
  searchPatients(searchTerm: string): Observable<PatientWithStats[]> {
    return this.getPatients().pipe(
      map((patients) =>
        patients.filter(
          (patient) =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }
}
