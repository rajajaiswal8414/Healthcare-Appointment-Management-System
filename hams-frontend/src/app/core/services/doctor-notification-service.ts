import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationResponseDTO } from '../../models/notification-interface';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DoctorNotificationService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getNotifications(): Observable<NotificationResponseDTO[]> {
    return this.http
      .get<NotificationResponseDTO[]>(`${this.baseUrl}${environment.doctor.getNotifications}`)
      .pipe(catchError(() => of(this.getMockNotifications())));
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/notifications/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/notifications/read-all`, {});
  }

  getUnreadNotificationCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/notifications/count`);
  }

  private getMockNotifications(): NotificationResponseDTO[] {
    return [
      {
        id: 1,
        appointmentId: 2,
        recipientType: 'DOCTOR',
        recipientId: 1,
        title: 'New Appointment Request',
        message: 'Sarah Johnson requested an appointment for tomorrow at 9:00 AM',
        createdAt: new Date().toISOString(),
        read: false,
      },
      {
        id: 2,
        appointmentId: 1,
        recipientType: 'DOCTOR',
        recipientId: 1,
        title: 'Appointment Reminder',
        message: 'You have an appointment with Michael Brown in 30 minutes',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
      },
      {
        id: 3,
        appointmentId: 3,
        recipientType: 'DOCTOR',
        recipientId: 1,
        title: 'Appointment Completed',
        message: 'Consultation with David Lee marked as completed',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: true,
      },
    ];
  }
}
