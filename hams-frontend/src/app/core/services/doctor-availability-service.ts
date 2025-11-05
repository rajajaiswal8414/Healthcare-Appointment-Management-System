// src/app/services/doctor-availability.service.ts

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AvailabilitySlot } from '../../models/availabilityslot-interface';
import { environment } from '../../environments/environment';

export interface DoctorAvailabilityPayload {
  id?: number; // Maps to existing 'id' for PUT
  availableDate: string; // The date calculated on the frontend
  startTime: string;
  endTime: string;
}

@Injectable({
  providedIn: 'root', // Makes the service a singleton available everywhere
})
export class DoctorAvailabilityService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/doctors/availability`;
  private apiUrl = environment.apiUrl;

  getScheduledSlots(): Observable<AvailabilitySlot[]> {
    return this.http.get<AvailabilitySlot[]>(this.baseUrl);
  }

  saveNewSlot(slot: Partial<AvailabilitySlot>): Observable<AvailabilitySlot> {
    return this.http.post<AvailabilitySlot>(this.baseUrl, slot);
  }

  updateSlot(slot: DoctorAvailabilityPayload): Observable<AvailabilitySlot> {
    return this.http.put<AvailabilitySlot>(`${this.baseUrl}/${slot.id}`, slot);
  }

  deleteSlot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getMyAvailabilityByDate(date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/doctor/availability?date=${date}`);
  }
}
