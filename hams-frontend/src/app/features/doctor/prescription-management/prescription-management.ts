// doctor-prescriptions.component.ts (New Component)

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Prescription, Medication } from '../../../models/prescription-interface';
import { Patient } from '../../../models/patient-interface';
import { DoctorPrescriptionService } from '../../../core/services/doctor-prescription-service';

@Component({
  selector: 'app-doctor-prescriptions',
  templateUrl: './prescription-management.html',
  imports: [CommonModule, FormsModule, RouterLink],
})
export class DoctorPrescriptions implements OnInit {
  currentTab: 'history' | 'create' = 'history';
  prescriptionHistory: Prescription[] = [];
  patientList: Patient[] = [];
  isEditMode: boolean = false;

  newPrescription: Partial<Prescription> = {
    patientId: null as any,
    diagnosis: '',
    medications: [{ name: '', dosage: '', instructions: '', durationDays: 7 }],
    status: 'Draft',
  };

  constructor(private prescriptionService: DoctorPrescriptionService) {}

  ngOnInit(): void {
    this.fetchPrescriptionHistory();
    this.fetchPatientList();
  }

  // --- Data Fetching ---

  fetchPrescriptionHistory(): void {
    this.prescriptionService.getPrescriptionHistory().subscribe({
      next: (data) => {
        this.prescriptionHistory = data;
      },
      error: (err) => {
        console.error('Failed to fetch prescription history:', err);
        // Fallback for development:
        this.prescriptionHistory = [
          {
            id: 101,
            patientId: 1,
            patientName: 'Alice Johnson',
            date: new Date('2025-10-10'),
            diagnosis: 'Viral Infection',
            medications: [
              {
                name: 'Paracetamol',
                dosage: '500mg',
                instructions: 'Twice daily',
                durationDays: 5,
              },
            ],
            status: 'Sent',
          },
          {
            id: 102,
            patientId: 2,
            patientName: 'Bob Smith',
            date: new Date('2025-10-14'),
            diagnosis: 'Headache',
            medications: [
              { name: 'Ibuprofen', dosage: '400mg', instructions: 'As needed', durationDays: 3 },
            ],
            status: 'Draft',
          },
        ];
      },
    });
  }

  fetchPatientList(): void {
    this.prescriptionService.getPatientList().subscribe({
      next: (data: Patient[]) => {
        this.patientList = data;
      },
      error: (err) => {
        console.error('Failed to fetch patient list:', err);
        // Fallback for development:
        this.patientList = [
          {
            patientId: 1,
            name: 'Alice Johnson',
            email: 'alice@email.com',
            contactNumber: '+1-555-0101',
            address: '123 Main St',
            gender: 'Female',
            dateOfBirth: '1989-03-15',
            bloodGroup: 'O+',
          },
          {
            patientId: 2,
            name: 'Bob Smith',
            email: 'bob@email.com',
            contactNumber: '+1-555-0102',
            address: '456 High St',
            gender: 'Male',
            dateOfBirth: '1985-07-22',
            bloodGroup: 'A+',
          },
          {
            patientId: 3,
            name: 'Charlie Doe',
            email: 'charlie@email.com',
            contactNumber: '+1-555-0103',
            address: '789 Lake Rd',
            gender: 'Male',
            dateOfBirth: '1992-11-05',
            bloodGroup: 'B+',
          },
        ];
      },
    });
  }

  // --- UI Logic ---

  switchTab(tab: 'history' | 'create'): void {
    this.currentTab = tab;
    if (tab === 'create' && !this.isEditMode) {
      this.resetForm();
    }
  }

  // --- Medication List Management ---

  addMedication(): void {
    this.newPrescription.medications!.push({
      name: '',
      dosage: '',
      instructions: '',
      durationDays: 7,
    });
  }

  removeMedication(index: number): void {
    this.newPrescription.medications!.splice(index, 1);
  }

  // --- Form Submission Logic ---

  saveDraft(): void {
    this.newPrescription.status = 'Draft';
    this.savePrescription(true);
  }

  savePrescription(isDraft: boolean = false): void {
    // Basic validation
    if (!this.newPrescription.patientId || !this.newPrescription.medications?.length) {
      alert('Please select a patient and add at least one medication.');
      return;
    }

    // Set final status if not saving as draft
    if (!isDraft) {
      this.newPrescription.status = 'Sent';
    }

    // Assign patient name for display/backend use
    const patient = this.patientList.find((p) => p.patientId === this.newPrescription.patientId);
    this.newPrescription.patientName = patient ? patient.name : 'Unknown Patient';
    this.newPrescription.date = new Date(); // Set current date

    if (this.isEditMode && this.newPrescription.id) {
      // Update existing prescription
      this.prescriptionService.updatePrescription(this.newPrescription as Prescription).subscribe({
        next: () => {
          alert(`Prescription updated and ${this.newPrescription.status} successfully!`);
          this.handleSuccessfulSubmission();
        },
        error: (err) => console.error('Update failed:', err),
      });
    } else {
      // Create new prescription
      this.prescriptionService.createPrescription(this.newPrescription).subscribe({
        next: () => {
          alert(`Prescription ${this.newPrescription.status} successfully!`);
          this.handleSuccessfulSubmission();
        },
        error: (err) => console.error('Creation failed:', err),
      });
    }
  }

  private handleSuccessfulSubmission(): void {
    this.fetchPrescriptionHistory();
    this.resetForm();
    this.switchTab('history');
  }

  viewPrescription(p: Prescription): void {
    // Logic to open a modal or navigate to a detailed view for printing/review
    alert(`Viewing Prescription # ${p.id} for ${p.patientName}.`);
  }

  deletePrescription(id: number): void {
    if (confirm('Are you sure you want to delete this draft prescription?')) {
      this.prescriptionService.deletePrescription(id).subscribe({
        next: () => {
          this.prescriptionHistory = this.prescriptionHistory.filter((p) => p.id !== id);
          alert('Draft deleted successfully.');
        },
        error: (err) => console.error('Delete failed:', err),
      });
    }
  }

  editPrescription(p: Prescription): void {
    this.newPrescription = { ...p };
    this.isEditMode = true;
    this.switchTab('create');
  }

  resetForm(): void {
    this.newPrescription = {
      patientId: null as any,
      diagnosis: '',
      medications: [{ name: '', dosage: '', instructions: '', durationDays: 7 }],
      status: 'Draft',
    };
    this.isEditMode = false;
  }
}
