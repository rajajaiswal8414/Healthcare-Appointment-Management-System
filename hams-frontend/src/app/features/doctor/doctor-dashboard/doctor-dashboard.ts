import { NotificationService } from './../../../core/services/patient-notification-service';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../core/services/doctor-appointment-service.js';
import { Appointment } from '../../../models/doctor-appointment-interface';
import { DoctorHeader } from '../../../shared/doctor/header/header.js';
import { NotificationResponseDTO } from '../../../models/notification-interface.js';
import { DoctorResponseDTO } from '../../../models/doctor-interface.js';
import { DoctorService } from '../../../core/services/doctor-service.js';
import { DoctorNotificationService } from '../../../core/services/doctor-notification-service';
import { Sidebar } from '@shared/doctor/sidebar/sidebar';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DoctorHeader, Sidebar],
  templateUrl: './doctor-dashboard.html',
  styleUrl: './doctor-dashboard.css',
})
export class DoctorDashboard implements OnInit {
  AppointmentCount: number = 0;
  totalPatientCount: number = 0;
  pendingReviewsCount: number = 0;
  doctor: DoctorResponseDTO | null = null;
  notifications: NotificationResponseDTO[] = [];
  stats = {
    upcomingAppointments: 0,
    activePrescriptions: 0,
    medicalRecords: 0,
    notifications: 0,
  };

  todayAppointments: Appointment[] = [];
  isLoading: boolean = false;

  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private notificationService: DoctorNotificationService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.fetchDoctorProfile();
    this.fetchNotificationCount();
    this.fetchAppointmentCount();
    this.fetchTotalPatientCount();
    this.fetchPendingReviewsCount();
    this.fetchTodayAppointments();
  }

  fetchAppointmentCount(): void {
    this.appointmentService.getTodayAppointmentCount().subscribe({
      next: (count: number) => {
        this.AppointmentCount = count;
      },
      error: (err: any) => {
        console.error('Failed to fetch today appointment count:', err);
      },
    });
  }

  fetchTotalPatientCount(): void {
    this.appointmentService.getTotalPatientCount().subscribe({
      next: (count: number) => {
        this.totalPatientCount = count;
      },
      error: (err: any) => {
        console.error('Failed to fetch total patient count:', err);
        this.totalPatientCount = 0;
      },
    });
  }

  fetchPendingReviewsCount(): void {
    this.appointmentService.getPendingReviewsCount().subscribe({
      next: (count: number) => {
        this.pendingReviewsCount = count;
      },
      error: (err: any) => {
        console.error('Failed to fetch pending reviews count:', err);
        this.pendingReviewsCount = 0;
      },
    });
  }

  fetchDoctorProfile(): void {
    this.doctorService.getLoggedInDoctorProfile().subscribe({
      next: (profile: DoctorResponseDTO) => {
        this.doctor = profile;
      },
      error: (err: any) => {
        console.error('Failed to fetch doctor profile:', err);
      },
    });
  }

  fetchNotificationCount(): void {
    this.notificationService.getUnreadNotificationCount().subscribe({
      next: (count: number) => {
        this.stats.notifications = count;
      },
      error: (err: any) => {
        console.error('Failed to fetch notification count:', err);
        this.stats.notifications = 0;
      },
    });
  }

  fetchTodayAppointments(): void {
    this.isLoading = true;
    this.appointmentService.getTodayAppointmentsForDoctor().subscribe({
      next: (appointments: Appointment[]) => {
        this.todayAppointments = appointments;
        this.isLoading = false;
        console.log('Today appointments loaded:', appointments);
      },
      error: (err: any) => {
        console.error('Failed to fetch today appointments:', err);
        this.todayAppointments = [];
        this.isLoading = false;
      },
    });
  }

  // In your component class

  confirmAppointment(appointmentId: number): void {
    // --- 1. Native Confirmation (If still used) ---
    if (!confirm('Are you sure you want to confirm this appointment?')) {
      return;
    }
    // ------------------------------------------------

    this.appointmentService.confirmAppointment(appointmentId).subscribe({
      next: () => {
        toast.success(`Appointment Confirmed 🎉`, {
          description: `The appointment has been successfully confirmed.`,
        });

        this.fetchTodayAppointments(); // Refresh the list
        this.fetchAppointmentCount(); // Update count
      },
      error: (err: any) => {
        console.error('Failed to confirm appointment:', err);

        const errorMessage = err.error?.message || 'Server error. Check logs.';

        toast.error('Confirmation Failed ❌', {
          description: `Could not confirm appointment: ${errorMessage}`,
        });
      },
    });
  }

  rejectAppointment(appointmentId: number): void {
    const reason = prompt('Please provide a reason for rejection (optional):');

    if (reason === null) {
      // User cancelled
      return;
    }

    this.appointmentService.rejectAppointment(appointmentId, reason || undefined).subscribe({
      next: () => {
        alert('Appointment rejected successfully!');
        this.fetchTodayAppointments(); // Refresh the list
        this.fetchAppointmentCount(); // Update count
      },
      error: (err: any) => {
        console.error('Failed to reject appointment:', err);
        alert('Failed to reject appointment. Please try again.');
      },
    });
  }

  viewAllAppointments(): void {
    this.router.navigate(['/doctor/appointments']);
  }

  viewAppointmentDetails(appointment: Appointment): void {
    console.log('Viewing appointment details:', appointment);
    // Navigate to appointment details page or open a modal
    this.router.navigate(['/doctor/appointments', appointment.appointmentId]);
  }

  generateInitials(fullName: string): string {
    if (!fullName) return 'SB';

    const nameParts = fullName
      .trim()
      .split(/\s+/)
      .filter((part) => part.length > 0);

    if (nameParts.length < 2) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }

    const firstInitial = nameParts[0].charAt(0).toUpperCase();
    const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();

    return firstInitial + lastInitial;
  }
}
