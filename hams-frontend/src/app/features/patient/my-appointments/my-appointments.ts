import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../../shared/patient/header/header';
import { AppointmentResponseDTO, PatientResponseDTO } from '../../../models/appointment-interface';
import { AppointmentService } from '../../../core/services/patient-appointment-service';
import { PatientService } from '../../../core/services/patient-service';
import { Sidebar } from '../../../shared/patient/sidebar/sidebar';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar, Header],
  templateUrl: './my-appointments.html',
  styleUrls: ['./my-appointments.css'],
})
export class MyAppointments implements OnInit {
  appointments: AppointmentResponseDTO[] = [];
  filteredAppointments: AppointmentResponseDTO[] = [];
  patient: PatientResponseDTO | null = null;
  filterStatus: string = 'all';

  // Modal states
  showCancelModal: boolean = false;
  showDetailsModal: boolean = false;
  showRescheduleModal: boolean = false;

  // Selected appointments
  appointmentToCancel: AppointmentResponseDTO | null = null;
  selectedAppointment: AppointmentResponseDTO | null = null;
  appointmentToReschedule: AppointmentResponseDTO | null = null;

  // Reschedule form data
  rescheduleDate: string = '';
  rescheduleTime: string = '';
  minDate: string = '';

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.loadPatientData();
    this.loadAppointments();
    this.setMinDate();
  }

  setMinDate(): void {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

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
        this.appointments = appointments;
        this.filterAppointments();
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
      },
    });
  }

  filterAppointments(): void {
    if (this.filterStatus === 'all') {
      this.filteredAppointments = this.appointments;
    } else {
      this.filteredAppointments = this.appointments.filter(
        (apt) => apt.status === this.filterStatus
      );
    }
  }

  onFilterChange(): void {
    this.filterAppointments();
  }

  // View Details Methods
  viewAppointmentDetails(appointment: AppointmentResponseDTO): void {
    this.selectedAppointment = appointment;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedAppointment = null;
  }

  // Cancel Appointment Methods
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
          this.loadAppointments();
          this.closeCancelModal();
        },
        error: (error) => {
          console.error('Error canceling appointment:', error);
        },
      });
    }
  }

  // Reschedule Appointment Methods
  openRescheduleModal(appointment: AppointmentResponseDTO): void {
    this.appointmentToReschedule = appointment;
    this.rescheduleDate = '';
    this.rescheduleTime = '';
    this.showRescheduleModal = true;
  }

  closeRescheduleModal(): void {
    this.showRescheduleModal = false;
    this.appointmentToReschedule = null;
    this.rescheduleDate = '';
    this.rescheduleTime = '';
  }

  // --- In my-appointments.ts ---

  rescheduleAppointment(): void {
    if (this.appointmentToReschedule && this.rescheduleDate && this.rescheduleTime) {
      // 1. GET THE EXISTING DOCTOR ID
      const existingDoctorId = this.appointmentToReschedule.doctor.doctorId; // Assuming this property exists

      this.appointmentService
        .updateAppointment(this.appointmentToReschedule.appointmentId, {
          appointmentDate: this.rescheduleDate,
          startTime: this.rescheduleTime.split('-')[0],
          endTime: this.rescheduleTime.split('-')[1],

          // 2. USE THE EXISTING DOCTOR ID (or don't send it, see option B)
          doctorId: existingDoctorId,
        })
        .subscribe({
          next: () => {
            alert('Appointment rescheduled successfully!');
            this.loadAppointments();
            this.closeRescheduleModal();
          },
          error: (error) => {
            console.error('Error rescheduling appointment:', error);
            alert('Failed to reschedule appointment. Check console for details.');
          },
        });
    }
  }

  // Utility Methods
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  canCancelAppointment(status: string): boolean {
    return status === 'PENDING' || status === 'CONFIRMED';
  }

  canRescheduleAppointment(status: string): boolean {
    return status === 'PENDING' || status === 'CONFIRMED';
  }

  getDoctorInitials(doctorName: string): string {
    return doctorName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }
}
