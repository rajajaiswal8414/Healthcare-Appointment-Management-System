import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../../shared/patient/header/header';
import { Patient } from '../../../models/patient-interface';
import { AppointmentDTO } from '../../../models/appointment-interface';
import { PatientService } from '../../../core/services/patient-service';
import { Sidebar } from '../../../shared/patient/sidebar/sidebar';
import { DoctorResponseDTO } from '../../../models/doctor-interface';
import { AppointmentService } from '../../../core/services/patient-appointment-service';
import { toast } from 'ngx-sonner';

interface DoctorAvailabilitySlot {
  availabilityId: number;
  availableDate: string;
  startTime: string;
  endTime: string;
}

@Component({
  selector: 'app-find-doctor',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar, Header],
  templateUrl: './find-doctor.html',
  styleUrls: ['./find-doctor.css'],
})
export class FindDoctorComponent implements OnInit {
  doctors: DoctorResponseDTO[] = [];
  filteredDoctors: DoctorResponseDTO[] = [];
  patient: Patient | null = null;
  searchTerm: string = '';
  searchType: 'name' | 'specialization' = 'name';
  showBookingModal: boolean = false;
  selectedDoctor: DoctorResponseDTO | null = null;
  selectedDate: string = '';
  availableSlots: DoctorAvailabilitySlot[] = [];
  selectedSlot: DoctorAvailabilitySlot | null = null;
  isLoadingSlots: boolean = false;

  appointmentData: AppointmentDTO = {
    doctorId: 0,
    appointmentDate: '',
    startTime: '',
    endTime: '',
    reason: '',
  };

  constructor(
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatientData();
    this.loadAllDoctors();
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

  loadAllDoctors(): void {
    this.patientService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.filteredDoctors = doctors;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
      },
    });
  }

  searchDoctors(): void {
    if (!this.searchTerm.trim()) {
      this.filteredDoctors = this.doctors;
      return;
    }

    if (this.searchType === 'name') {
      this.patientService.searchDoctorByName(this.searchTerm).subscribe({
        next: (doctors) => {
          this.filteredDoctors = doctors;
        },
        error: (error) => {
          console.error('Error searching doctors by name:', error);
        },
      });
    } else {
      this.patientService.searchDoctorBySpecialization(this.searchTerm).subscribe({
        next: (doctors) => {
          this.filteredDoctors = doctors;
        },
        error: (error) => {
          console.error('Error searching doctors by specialization:', error);
        },
      });
    }
  }

  openBookingModal(doctor: DoctorResponseDTO): void {
    this.selectedDoctor = doctor;
    this.appointmentData.doctorId = doctor.doctorId;
    this.showBookingModal = true;
    this.selectedDate = '';
    this.availableSlots = [];
    this.selectedSlot = null;
  }

  onDateChange(): void {
    if (this.selectedDate && this.selectedDoctor) {
      this.loadAvailableSlots();
    } else {
      this.availableSlots = [];
      this.selectedSlot = null;
    }
  }

  loadAvailableSlots(): void {
    if (!this.selectedDoctor || !this.selectedDate) return;

    this.isLoadingSlots = true;
    // You need to add this method to your PatientService
    this.patientService
      .getDoctorAvailabilityByDate(this.selectedDoctor.doctorId, this.selectedDate)
      .subscribe({
        next: (slots) => {
          this.availableSlots = slots;
          this.selectedSlot = null;
          this.isLoadingSlots = false;
        },
        error: (error) => {
          console.error('Error loading available slots:', error);
          this.availableSlots = [];
          this.isLoadingSlots = false;
        },
      });
  }

  selectSlot(slot: DoctorAvailabilitySlot): void {
    this.selectedSlot = slot;
    this.appointmentData.appointmentDate = slot.availableDate;
    this.appointmentData.startTime = this.formatTime(slot.startTime);
    this.appointmentData.endTime = this.formatTime(slot.endTime);
  }

  formatTime(time: string): string {
    if (time && time.split(':').length === 2) {
      return `${time}:00`;
    }
    return time;
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
    this.selectedDoctor = null;
    this.selectedDate = '';
    this.availableSlots = [];
    this.selectedSlot = null;
    this.appointmentData = {
      doctorId: 0,
      appointmentDate: '',
      startTime: '',
      endTime: '',
      reason: '',
    };
  }

  bookAppointment(): void {
    if (
      this.appointmentData.doctorId &&
      this.appointmentData.appointmentDate &&
      this.appointmentData.startTime &&
      this.appointmentData.endTime
    ) {
      this.appointmentService.bookAppointment(this.appointmentData).subscribe({
        next: (appointment) => {
          console.log('Appointment booked successfully:', appointment);

          // --- SUCCESS TOAST ---
          toast.success('Appointment Confirmed 🎉', {
            description: 'Your appointment has been successfully booked.',
          });
          // alert('Appointment booked successfully!'); // Removed

          this.closeBookingModal();
          this.router.navigate(['/patient/my-appointments']);
        },
        error: (error) => {
          console.error('Error booking appointment:', error);

          // --- ERROR TOAST ---
          const errorMessage = error.error?.message || 'Slot already booked.';
          toast.error('Booking Failed ❌', {
            description: `Failed to book appointment: ${errorMessage} Please try again.`,
          });
          // alert('Failed to book appointment. Please try again.'); // Removed
        },
      });
    } else {
      // --- VALIDATION TOAST ---
      toast.warning('Missing Selection', {
        description: 'Please ensure a doctor, date, and time slot are selected.',
      });
      // alert('Please select a date and time slot.'); // Removed
    }
  }

  getDoctorInitials(doctorName: string): string {
    return doctorName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}
