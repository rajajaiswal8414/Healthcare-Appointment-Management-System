import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
// Using the corrected service name and path
import { DoctorPatientService } from '../../../core/services/doctor-patient-service';
import { MedicalRecordService } from 'src/app/core/services/medical-record-service';
import { DoctorAuthService } from 'src/app/core/services/doctor-auth-service';

// Patient interface matching backend DTO (PatientResponseDTO)
// 'age' is intentionally omitted here as it's a derived field.
export interface PatientWithStats {
  patientId: number;
  name: string;
  dateOfBirth: string; // The source of age
  gender: string;
  contactNumber: string;
  email: string;
  bloodGroup?: string;
  address?: string;

  totalVisits: number;
  activeTreatments: number;
  lastVisit?: string;
  registrationDate?: string;
}

// Helper Interface for Frontend Operations (includes age)
interface PatientWithAge extends PatientWithStats {
  age: number;
}

@Component({
  selector: 'app-patient-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './patient-management.html',
  styleUrl: './patient-management.css',
})
export class PatientManagement implements OnInit {
  private authDoctorService = inject(DoctorAuthService);

  // View state
  currentView: 'grid' | 'list' = 'grid';
  showProfileModal = false;
  // Use PatientWithStats for selectedPatient, but cast to PatientWithAge when setting for the modal
  selectedPatient: PatientWithAge | null = null;
  isLoading = false;

  // Filter state
  searchTerm = '';
  genderFilter = 'all';
  ageFilter = 'all';
  sortFilter = 'name';

  // Statistics
  totalCount = 0;
  newCount = 0;
  activeCount = 0;
  followupCount = 0;

  // Data
  patients: PatientWithStats[] = [];

  constructor(
    private patientService: DoctorPatientService,
    private medicalRecordService: MedicalRecordService,
    private router: Router
  ) {}

  /**
   * FIX: This getter now explicitly calculates and maps the 'age' property
   * onto a temporary array (PatientWithAge[]) before filtering/sorting,
   * ensuring all view logic has the required 'age' property.
   */
  get filteredPatients(): PatientWithAge[] {
    // 1. Map to include the derived 'age' property
    let processedPatients: PatientWithAge[] = this.patients.map((patient) => ({
      ...patient,
      age: this.calculateAge(patient.dateOfBirth),
    }));

    let filtered = [...processedPatients];

    // Search filter (uses name, email, contactNumber)
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (patient) =>
          patient.name.toLowerCase().includes(search) ||
          patient.email.toLowerCase().includes(search) ||
          patient.contactNumber.toLowerCase().includes(search)
      );
    }

    // Gender filter
    if (this.genderFilter !== 'all') {
      filtered = filtered.filter((patient) => patient.gender === this.genderFilter);
    }

    // Age filter (uses the calculated 'age' property)
    if (this.ageFilter !== 'all') {
      filtered = filtered.filter((patient) => {
        const age = patient.age; // Now safe to use 'age'
        switch (this.ageFilter) {
          case '0-18':
            return age >= 0 && age <= 18;
          case '19-35':
            return age >= 19 && age <= 35;
          case '36-60':
            return age >= 36 && age <= 60;
          case '60+':
            return age > 60;
          default:
            return true;
        }
      });
    }

    // Sort filter
    filtered.sort((a, b) => {
      switch (this.sortFilter) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'age':
          // FIX: The age sort is now correctly comparing a.age and b.age
          return a.age - b.age;
        case 'visits':
          return b.totalVisits - a.totalVisits;
        case 'lastVisit':
          if (!a.lastVisit || !b.lastVisit) return 0;
          return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        // FIX: Assign raw DTO data without calculating age here.
        this.patients = patients as PatientWithStats[];
        this.calculateStats();
        this.isLoading = false;
        console.log('Loaded raw patients:', patients);
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.patients = [];
        this.isLoading = false;
      },
    });
  }

  // --- View Control Methods ---

  switchView(view: 'grid' | 'list'): void {
    this.currentView = view;
  }

  refreshView(): void {
    // Changing filters/sorts automatically triggers the filteredPatients getter recalculation
    console.log('Filters or sort changed. View update triggered.');
  }

  // --- Utility Methods ---

  calculateStats(): void {
    this.totalCount = this.patients.length;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    this.newCount = this.patients.filter((p) => {
      if (!p.registrationDate) return false;
      const regDate = new Date(p.registrationDate);
      return regDate >= thirtyDaysAgo;
    }).length;

    this.activeCount = this.patients.reduce((sum, p) => sum + (p.activeTreatments || 0), 0);

    this.followupCount = this.patients.filter((p) => {
      if (!p.lastVisit) return false;
      const lastVisit = new Date(p.lastVisit);
      const daysDiff = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 30;
    }).length;
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getDaysSinceVisit(lastVisit?: string): number {
    if (!lastVisit) return 0;
    const visitDate = new Date(lastVisit);
    const now = new Date();
    return Math.floor((now.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  formatVisitDate(date?: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * FIX: Manually calculate and inject the 'age' property when selecting for the modal view,
   * since the PatientWithStats DTO object doesn't include it.
   */
  viewProfile(patient: PatientWithStats): void {
    // Note: The 'age' property is correctly calculated and added here
    this.selectedPatient = {
      ...patient,
      age: this.calculateAge(patient.dateOfBirth),
    }; // No need for 'as PatientWithStats' cast anymore, as it's now PatientWithAge
    this.showProfileModal = true;
  }

  closeModal(): void {
    this.showProfileModal = false;
    this.selectedPatient = null;
  }

  bookAppointment(patient: PatientWithStats): void {
    console.log('Booking appointment for patient ID:', patient.patientId);
    this.router.navigate(['/doctor/appointments'], {
      queryParams: { patientId: patient.patientId, action: 'book' },
    });
  }

  sendMessage(patient: PatientWithStats): void {
    console.log('Sending message to patient ID:', patient.patientId);
    alert('Messaging feature coming soon for ' + patient.name);
  }

  viewMedicalRecords(patient: PatientWithStats): void {
    console.log('Viewing medical records for patient ID:', patient.patientId);
    this.router.navigate(['/doctor/medical-record'], {
      queryParams: { patientId: patient.patientId },
    });
  }

  /**
   * Calculates the age based on an ISO date string (YYYY-MM-DD).
   */
  calculateAge(dateOfBirth: string | undefined): number {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't happened yet this year
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  logout(): void {
    this.authDoctorService.logout();
  }
}
