import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; // Removed 'of' and 'catchError'
import { Patient, PatientDTO } from '../../models/patient-interface';
import { DoctorResponseDTO } from '../../models/doctor-interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private baseUrl = environment.apiUrl + '/patients';
  // Removed private useMockData = false;

  constructor(private http: HttpClient) {}

  getPatient(): Observable<Patient> {
    return this.http.get<Patient>(`${this.baseUrl}/me`);
  }

  updatePatient(patientDTO: PatientDTO): Observable<Patient> {
    return this.http.patch<Patient>(`${this.baseUrl}/me`, patientDTO);
  }

  searchDoctorByName(name: string): Observable<DoctorResponseDTO[]> {
    return this.http.get<DoctorResponseDTO[]>(`${this.baseUrl}/doctor-name?name=${name}`);
  }

  searchDoctorBySpecialization(specialization: string): Observable<DoctorResponseDTO[]> {
    return this.http.get<DoctorResponseDTO[]>(
      `${this.baseUrl}/doctor-specialization?specialization=${specialization}`
    );
  }

  getAllDoctors(): Observable<DoctorResponseDTO[]> {
    return this.http.get<DoctorResponseDTO[]>(`${this.baseUrl}/all-doctors`);
  }

  getDoctorAvailabilityByDate(doctorId: number, date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/doctor-availability/${doctorId}?date=${date}`);
  }
}
