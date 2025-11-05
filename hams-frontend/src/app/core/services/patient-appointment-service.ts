import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentDTO, AppointmentResponseDTO } from '../../models/appointment-interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private api = environment.apiUrl; // http://localhost:8080/api

  constructor(private http: HttpClient) {}

  bookAppointment(appointmentDTO: AppointmentDTO): Observable<AppointmentResponseDTO> {
    return this.http.post<AppointmentResponseDTO>(
      `${this.api}${environment.patient.addAppointments}`,
      appointmentDTO
    );
  }

  getAppointmentsForPatient(): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(
      `${this.api}${environment.patient.getAppointments}`
    );
  }

  getAppointmentById(appointmentId: number): Observable<AppointmentResponseDTO> {
    return this.http.get<AppointmentResponseDTO>(`${this.api}/appointments/${appointmentId}`);
  }

  updateAppointment(
    appointmentId: number,
    appointmentDTO: AppointmentDTO
  ): Observable<AppointmentResponseDTO> {
    return this.http.patch<AppointmentResponseDTO>(
      `${this.api}${environment.patient.updateAppointment.replace(
        '{appointmentId}',
        String(appointmentId)
      )}`,
      appointmentDTO
    );
  }

  cancelAppointment(appointmentId: number): Observable<AppointmentResponseDTO> {
    return this.http.patch<AppointmentResponseDTO>(
      `${this.api}${environment.patient.cancelAppointment.replace(
        '{appointmentId}',
        String(appointmentId)
      )}`,
      {}
    );
  }

  // Doctor: get own appointments
  getAppointmentsForDoctor(): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.api}/doctors/me/appointments`);
  }
}
