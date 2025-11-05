import { DoctorAuthService } from './../../../core/services/doctor-auth-service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicalRecordResponseDTO } from '../../../models/medicalrecord-interface';
import { MedicalRecordService } from '../../../core/services/medical-record-service';
import { DoctorService } from '../../../core/services/doctor-service';
import { DoctorResponseDTO } from 'src/app/models/doctor-interface';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doctor-medical-records',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './medical-record.html',
  styleUrls: ['./medical-record.css'],
})
export class DoctorMedicalRecords implements OnInit {
  medicalRecords: MedicalRecordResponseDTO[] = [];
  filteredRecords: MedicalRecordResponseDTO[] = [];
  doctor: DoctorResponseDTO | null = null;
  selectedRecord: MedicalRecordResponseDTO | null = null;
  showRecordModal: boolean = false;
  isLoading: boolean = true;

  // Search and filter properties
  searchTerm: string = '';
  patientFilter: string = '';
  dateFilter: string = 'all';

  // Unique patients for filter
  uniquePatients: string[] = [];

  constructor(
    private medicalRecordService: MedicalRecordService,
    private doctorService: DoctorService,
    private doctorAuthService: DoctorAuthService
  ) {}

  ngOnInit(): void {
    this.loadDoctorData();
    // console.log('Going');
    // this.loadMedicalRecords();
  }

  loadDoctorData(): void {
    this.doctorService.getLoggedInDoctorProfile().subscribe({
      next: (doctor) => {
        this.doctor = doctor;
        this.loadMedicalRecords();
      },
      error: (error) => {
        console.error('Error loading doctor data:', error);
      },
    });
  }

  loadMedicalRecords(): void {
    if (!this.doctor) return;

    // console.log('doctor', this.doctor);
    this.isLoading = true;
    this.medicalRecordService.getRecordsForDoctor().subscribe({
      next: (records) => {
        this.medicalRecords = records;
        this.filteredRecords = records;
        this.extractUniquePatients();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading medical records:', error);
        this.isLoading = false;
      },
    });
  }

  extractUniquePatients(): void {
    const patients = this.medicalRecords.map((record) => record.patientName);
    this.uniquePatients = [...new Set(patients)].sort();
  }

  filterRecords(): void {
    let filtered = this.medicalRecords;

    // Filter by patient name
    if (this.patientFilter) {
      filtered = filtered.filter((record) => record.patientName === this.patientFilter);
    }

    // Filter by search term (patient name or diagnosis)
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.patientName.toLowerCase().includes(search) ||
          (record.diagnosis && record.diagnosis.toLowerCase().includes(search)) ||
          (record.reason && record.reason.toLowerCase().includes(search))
      );
    }

    // Filter by date
    if (this.dateFilter !== 'all') {
      const today = new Date();
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.createdAt);

        switch (this.dateFilter) {
          case 'today':
            return recordDate.toDateString() === today.toDateString();
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return recordDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            return recordDate >= monthAgo;
          case 'year':
            const yearAgo = new Date(today);
            yearAgo.setFullYear(today.getFullYear() - 1);
            return recordDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    this.filteredRecords = filtered;
  }

  viewRecordDetails(record: MedicalRecordResponseDTO): void {
    this.selectedRecord = record;
    this.showRecordModal = true;
  }

  closeRecordModal(): void {
    this.showRecordModal = false;
    this.selectedRecord = null;
  }

  downloadPrescription(record: MedicalRecordResponseDTO): void {
    console.log('Downloading prescription for record:', record.recordId);
    // Implement prescription download logic
  }

  getPatientInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.patientFilter = '';
    this.dateFilter = 'all';
    this.filterRecords();
  }

  logout(): void {
    this.doctorAuthService.logout();
  }
}
