import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppointmentResponseDTO, PatientResponseDTO } from '../../../models/appointment-interface';
import { Header } from '../../../shared/patient/header/header';
import { MedicalRecordResponseDTO } from '../../../models/medicalrecord-interface';
import { NotificationResponseDTO } from '../../../models/notification-interface';
import { PatientService } from '../../../core/services/patient-service';
import { Sidebar } from '../../../shared/patient/sidebar/sidebar';
import { AppointmentService } from '../../../core/services/patient-appointment-service';
import { MedicalRecordService } from '../../../core/services/medical-record-service';
import { NotificationService } from '../../../core/services/patient-notification-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  // 🚨 Add FormsModule to imports
  imports: [CommonModule, Sidebar, Header, FormsModule],
  templateUrl: './patient-dashboard.html',
  styleUrls: ['./patient-dashboard.css'],
})
export class PatientDashboard implements OnInit {
  patient: PatientResponseDTO | null = null;
  upcomingAppointments: AppointmentResponseDTO[] = [];
  medicalRecords: MedicalRecordResponseDTO[] = [];
  notifications: NotificationResponseDTO[] = [];
  stats = {
    upcomingAppointments: 0,
    activePrescriptions: 0,
    medicalRecords: 0,
    notifications: 0,
  };

  // 🚨 MODAL STATE PROPERTIES
  showCancelModal: boolean = false;
  showDetailsModal: boolean = false;
  appointmentToCancel: AppointmentResponseDTO | null = null;
  selectedAppointment: AppointmentResponseDTO | null = null;

  // Reschedule is typically for a dedicated page, but we'll include the helper function:
  canCancelAppointment(status: string): boolean {
    return status === 'PENDING' || status === 'CONFIRMED';
  }

  constructor(
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private medicalRecordService: MedicalRecordService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatientData();
    this.loadAppointments();
    this.loadMedicalRecords();
    // this.loadNotifications();
    this.fetchNotificationCount();
  }

  // ... existing load methods (loadPatientData, loadAppointments, loadMedicalRecords, loadNotifications) ...
  loadPatientData(): void {
    this.patientService.getPatient().subscribe({
      next: (patient) => {
        this.patient = patient;
      },
      error: (error) => {
        console.error('Error loading patient data:', error);
      },
    });
  }

  loadAppointments(): void {
    this.appointmentService.getAppointmentsForPatient().subscribe({
      next: (appointments) => {
        this.upcomingAppointments = appointments
          .filter((apt) => apt.status === 'PENDING' || apt.status === 'CONFIRMED')
          .slice(0, 3);
        this.stats.upcomingAppointments = this.upcomingAppointments.length;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
      },
    });
  }

  loadMedicalRecords(): void {
    this.medicalRecordService.getRecordsForPatient().subscribe({
      next: (records) => {
        this.medicalRecords = records;
        this.stats.medicalRecords = records.length;
        this.stats.activePrescriptions = records.reduce(
          (count, record) => count + (record.prescriptions ? record.prescriptions.length : 0),
          0
        );
      },
      error: (error) => {
        console.error('Error loading medical records:', error);
      },
    });
  }

  // loadNotifications(): void {
  //   this.notificationService.getPatientNotifications().subscribe({
  //     next: (notifications) => {
  //       this.notifications = notifications;
  //       this.stats.notifications = notifications.length;
  //     },
  //     error: (error) => {
  //       console.error('Error loading notifications:', error);
  //     },
  //   });
  // }

  fetchNotificationCount(): void {
    // 🔑 FIX 1: Change 'markAllAsRead' to a method designed to GET the count (e.g., 'getUnreadNotificationCount').
    // 🔑 FIX 2: Add parentheses () to call the method.
    this.notificationService.getUnreadNotificationCount().subscribe({
      next: (count: number) => {
        // The service should return the count, which is then assigned to stats.notifications
        this.stats.notifications = count;
      },
      error: (err: any) => {
        console.error('Failed to fetch notification count:', err);
        this.stats.notifications = 0; // Set to 0 on failure
      },
    });
  }

  // 🚨 VIEW DETAILS METHODS
  viewAppointmentDetails(appointment: AppointmentResponseDTO): void {
    this.selectedAppointment = appointment;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedAppointment = null;
  }

  // 🚨 CANCEL APPOINTMENT METHODS
  openCancelModal(appointment: AppointmentResponseDTO): void {
    this.appointmentToCancel = appointment;
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.appointmentToCancel = null;
  }

  cancelAppointment(): void {
    if (this.appointmentToCancel) {
      this.appointmentService.cancelAppointment(this.appointmentToCancel.appointmentId).subscribe({
        next: () => {
          // Refresh the appointments list after cancellation
          this.loadAppointments();
          this.closeCancelModal();
        },
        error: (error) => {
          console.error('Error canceling appointment:', error);
          alert('Failed to cancel appointment.');
        },
      });
    }
  }

  navigateToFindDoctors(): void {
    this.router.navigate(['/patient/find-doctors']);
  }

  // Utility method for doctor initials (copied from MyAppointments for completeness)
  getDoctorInitials(doctorName: string): string {
    return doctorName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
