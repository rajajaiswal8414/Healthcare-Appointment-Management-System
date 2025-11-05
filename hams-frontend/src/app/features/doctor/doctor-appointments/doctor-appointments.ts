import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../../core/services/doctor-appointment-service';
import { DoctorAvailabilityService } from 'src/app/core/services/doctor-availability-service';
import { DoctorAuthService } from 'src/app/core/services/doctor-auth-service';
import { Appointment } from 'src/app/models/doctor-appointment-interface';
import { DoctorAvailabilityPayload } from 'src/app/models/availabilityslot-interface';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  templateUrl: './doctor-appointments.html',
  imports: [FormsModule, CommonModule, RouterLink],
})
export class DoctorAppointments implements OnInit {
  private appointmentService = inject(AppointmentService);
  private availabilityService = inject(DoctorAvailabilityService);
  private doctorAuthService = inject(DoctorAuthService);

  appointments = signal<Appointment[]>([]);
  filteredAppointments = signal<Appointment[]>([]);
  isLoading = signal(true);
  currentAppointmentId: number | null = null;

  // Filters
  searchTerm = '';
  dateFilter = 'all';
  statusFilter = 'all';

  // Stats
  todayCount = signal(0);
  pendingCount = signal(0);
  confirmedCount = signal(0);
  completedCount = signal(0);

  // Consultation Modal
  isNotesModalOpen = signal(false);
  consultationNotes = { diagnosis: '', symptoms: '', notes: '', prescription: '' };

  // Reschedule Modal
  isRescheduleModalOpen = signal(false);
  selectedAppointmentForReschedule: Appointment | null = null;
  rescheduleDate: string = '';
  availableSlots: DoctorAvailabilityPayload[] = [];
  selectedSlot: DoctorAvailabilityPayload | null = null;
  isLoadingSlots: boolean = false;

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading.set(true);
    this.appointmentService.getDoctorAppointments('all').subscribe({
      next: (data) => {
        this.appointments.set(data);
        this.updateStats();
        this.filterAppointments();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load appointments:', err);
        this.appointments.set([]);
        this.isLoading.set(false);
        // Replaced alert with toast
        toast.error('Failed to Load Appointments', {
          description: 'Please check your network connection or API configuration.',
        });
      },
    });
  }

  updateStats(): void {
    const apps = this.appointments();
    const today = new Date().toISOString().split('T')[0];
    this.todayCount.set(apps.filter((a) => a.appointmentDate === today).length);
    this.pendingCount.set(apps.filter((a) => a.status === 'PENDING').length);
    this.confirmedCount.set(apps.filter((a) => a.status === 'CONFIRMED').length);
    this.completedCount.set(apps.filter((a) => a.status === 'COMPLETED').length);
  }

  formatTime(time: string): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  filterAppointments(): void {
    const search = this.searchTerm.toLowerCase();
    const today = new Date();

    const filtered = this.appointments().filter((a) => {
      const matchesSearch = a.patient.name.toLowerCase().includes(search);
      const matchesStatus = this.statusFilter === 'all' || a.status === this.statusFilter;

      const appointmentDate = new Date(a.appointmentDate);
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const appointmentDateOnly = new Date(
        appointmentDate.getFullYear(),
        appointmentDate.getMonth(),
        appointmentDate.getDate()
      );
      let matchesDate = true;

      if (this.dateFilter === 'today') {
        matchesDate = appointmentDateOnly.getTime() === todayDateOnly.getTime();
      } else if (this.dateFilter === 'tomorrow') {
        const tomorrow = new Date(todayDateOnly);
        tomorrow.setDate(todayDateOnly.getDate() + 1);
        matchesDate = appointmentDateOnly.getTime() === tomorrow.getTime();
      } else if (this.dateFilter === 'week') {
        const weekFromNow = new Date(todayDateOnly);
        weekFromNow.setDate(todayDateOnly.getDate() + 7);
        matchesDate =
          appointmentDateOnly.getTime() >= todayDateOnly.getTime() &&
          appointmentDateOnly.getTime() <= weekFromNow.getTime();
      } else if (this.dateFilter === 'month') {
        matchesDate =
          appointmentDate.getFullYear() === today.getFullYear() &&
          appointmentDate.getMonth() === today.getMonth();
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    this.filteredAppointments.set(filtered);
  }

  confirmAppointment(id: number): void {
    const appointment = this.appointments().find((a) => a.appointmentId === id);
    if (!appointment) return;

    // NOTE: Replaced blocking confirm() with direct action. You should implement a custom modal
    // or confirmation service here for a proper user flow.
    this.appointmentService.confirmAppointment(id).subscribe({
      next: () => {
        // Replaced alert with toast
        toast.success('Appointment Confirmed', {
          description: `Appointment with ${appointment.patient.name} is now CONFIRMED.`,
          duration: 3000,
        });
        this.loadAppointments();
      },
      error: (err) => {
        console.error('Confirm failed:', err);
        // Replaced alert with toast
        toast.error('Confirmation Failed', {
          description: 'Failed to confirm appointment. Please try again.',
          duration: 5000,
        });
      },
    });
  }

  cancelAppointment(id: number): void {
    const appointment = this.appointments().find((a) => a.appointmentId === id);
    if (!appointment) return;

    // NOTE: Replaced blocking prompt() with a placeholder reason. You must implement a custom
    // input modal to gather the cancellation reason from the user.
    const reason = 'Doctor unavailable - temporary placeholder reason.';

    if (reason) {
      this.appointmentService.rejectAppointment(id, reason).subscribe({
        next: () => {
          // Replaced alert with toast
          toast.success('Appointment Rejected', {
            description: `Appointment with ${appointment.patient.name} has been rejected.`,
            duration: 3000,
          });
          this.loadAppointments();
        },
        error: (err) => {
          console.error('Reject failed:', err);
          // Replaced alert with toast
          toast.error('Rejection Failed', {
            description: 'Failed to reject appointment. Please try again.',
            duration: 5000,
          });
        },
      });
    }
  }

  startConsultation(id: number): void {
    this.currentAppointmentId = id;
    this.consultationNotes = { diagnosis: '', symptoms: '', notes: '', prescription: '' };
    this.isNotesModalOpen.set(true);
  }

  saveNotes(): void {
    if (!this.currentAppointmentId) return;

    const appointment = this.appointments().find(
      (a) => a.appointmentId === this.currentAppointmentId
    );
    if (!appointment) {
      // Replaced alert with toast
      toast.warning('Action Blocked', {
        description: 'Cannot save notes. Appointment data not found.',
      });
      return;
    }

    // Prepare medical record data
    const medicalRecordData = {
      appointmentId: this.currentAppointmentId,
      patientId: appointment.patient.patientId || 0, // You'll need to add patientId to Patient interface
      doctorId: appointment.doctor.doctorId,
      reason: appointment.reason || 'Consultation',
      diagnosis: this.consultationNotes.diagnosis,
      notes: this.consultationNotes.notes,
      prescriptions: this.consultationNotes.prescription
        ? [
            {
              medicationName: this.consultationNotes.prescription,
              dosage: '', // Can be enhanced to capture separately
              instructions: this.consultationNotes.symptoms || '',
            },
          ]
        : [],
    };

    console.log('Saving medical record:', medicalRecordData);

    this.appointmentService.completeMedicalRecord(medicalRecordData).subscribe({
      next: () => {
        // Replaced alert with toast
        toast.success('Consultation Completed', {
          description: 'Notes saved and appointment marked as COMPLETED.',
          duration: 3000,
        });
        this.isNotesModalOpen.set(false);
        this.loadAppointments();
      },
      error: (err) => {
        console.error('Save notes failed:', err);
        console.error('Error details:', err.error);
        // Replaced alert with toast
        toast.error('Save Failed', {
          description: `Failed to save notes: ${
            err.error?.message || 'Check your API configuration.'
          }`,
          duration: 7000,
        });
      },
    });
  }

  // Reschedule Functions
  openRescheduleModal(appointment: Appointment): void {
    this.selectedAppointmentForReschedule = appointment;
    this.rescheduleDate = '';
    this.availableSlots = [];
    this.selectedSlot = null;
    this.isRescheduleModalOpen.set(true);
  }

  closeRescheduleModal(): void {
    this.isRescheduleModalOpen.set(false);
    this.selectedAppointmentForReschedule = null;
    this.rescheduleDate = '';
    this.availableSlots = [];
    this.selectedSlot = null;
  }

  onRescheduleDateChange(): void {
    if (this.rescheduleDate && this.selectedAppointmentForReschedule) {
      this.loadAvailableSlotsForReschedule();
    } else {
      this.availableSlots = [];
      this.selectedSlot = null;
    }
  }

  loadAvailableSlotsForReschedule(): void {
    if (!this.rescheduleDate) return;

    this.isLoadingSlots = true;
    console.log('Loading slots for date:', this.rescheduleDate);

    // You need to add this method to your AppointmentService
    // It should call the backend to get available slots for the logged-in doctor
    this.availabilityService.getMyAvailabilityByDate(this.rescheduleDate).subscribe({
      next: (slots) => {
        console.log('Received slots:', slots);
        this.availableSlots = slots;
        this.selectedSlot = null;
        this.isLoadingSlots = false;
      },
      error: (error) => {
        console.error('Error loading available slots:', error);
        console.error('Error details:', error.error);
        this.availableSlots = [];
        this.isLoadingSlots = false;
        // Replaced alert with toast
        toast.error('Slot Loading Failed', {
          description: 'Failed to load available slots. Check console for details.',
          duration: 7000,
        });
      },
    });
  }

  selectSlotForReschedule(slot: DoctorAvailabilityPayload): void {
    this.selectedSlot = slot;
  }

  confirmReschedule(): void {
    if (!this.selectedSlot || !this.selectedAppointmentForReschedule) {
      // Replaced alert with toast
      toast.warning('Reschedule Failed', {
        description: 'Please select a new date and time slot.',
      });
      return;
    }

    const rescheduleData = {
      appointmentDate: this.selectedSlot.availableDate,
      startTime: this.formatTimeToHHMMSS(this.selectedSlot.startTime),
      endTime: this.formatTimeToHHMMSS(this.selectedSlot.endTime),
    };

    console.log('Rescheduling with data:', rescheduleData);

    this.appointmentService
      .rescheduleAppointment(this.selectedAppointmentForReschedule.appointmentId, rescheduleData)
      .subscribe({
        next: () => {
          // Replaced alert with toast
          toast.success('Reschedule Successful', {
            description: 'The appointment has been updated.',
            duration: 3000,
          });
          this.closeRescheduleModal();
          this.loadAppointments();
        },
        error: (error) => {
          console.error('Error rescheduling appointment:', error);
          console.error('Error details:', error.error);
          // Replaced alert with toast
          toast.error('Reschedule Failed', {
            description: `Failed to reschedule: ${error.error?.message || 'Please try again.'}`,
            duration: 7000,
          });
        },
      });
  }

  formatTimeToHHMMSS(time: string): string {
    // Convert to HH:mm:ss format
    if (!time) return time;
    const parts = time.split(':');
    if (parts.length === 2) {
      // HH:mm → HH:mm:ss
      return `${parts[0]}:${parts[1]}:00`;
    }
    // Already HH:mm:ss
    return time;
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  viewNotes(notes: string): void {
    // Replaced alert with toast and console log for large text
    toast.info('Consultation Notes Logged', {
      description: 'Full notes displayed in console for review.',
      duration: 4000,
    });
    console.log('📝 Consultation Notes:', notes);
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  logout(): void {
    this.doctorAuthService.logout();
    toast.info('Logged Out', {
      description: 'You have been successfully logged out.',
      duration: 3000,
    });
  }
}
