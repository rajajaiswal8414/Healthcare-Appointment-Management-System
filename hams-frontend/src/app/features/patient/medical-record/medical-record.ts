import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../../shared/patient/header/header';
import { MedicalRecordResponseDTO } from '../../../models/medicalrecord-interface';
import { Patient } from '../../../models/patient-interface';
import { PatientService } from '../../../core/services/patient-service';
import { Sidebar } from '../../../shared/patient/sidebar/sidebar';
import { MedicalRecordService } from '../../../core/services/medical-record-service';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule, Sidebar, Header],
  templateUrl: './medical-record.html',
  styleUrls: ['./medical-record.css'],
})
export class MedicalRecord implements OnInit {
  medicalRecords: MedicalRecordResponseDTO[] = [];
  patient: Patient | null = null;
  selectedRecord: MedicalRecordResponseDTO | null = null;
  showRecordModal: boolean = false;

  constructor(
    private medicalRecordService: MedicalRecordService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.loadPatientData();
    this.loadMedicalRecords();
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

  loadMedicalRecords(): void {
    this.medicalRecordService.getRecordsForPatient().subscribe({
      next: (records) => {
        this.medicalRecords = records;
      },
      error: (error) => {
        console.error('Error loading medical records:', error);
      },
    });
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
    // Implement prescription download logic
    console.log('Downloading prescription for record:', record.recordId);
    // This would typically generate a PDF or download a file
  }

  hasPrescriptions(record: MedicalRecordResponseDTO): boolean {
    return record.prescriptions && record.prescriptions.length > 0;
  }
}
