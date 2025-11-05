import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { CommonModule, AsyncPipe, TitleCasePipe, Location } from '@angular/common';
import { Patient, PatientDTO } from '../../../models/patient-interface';
import { PatientService } from '../../../core/services/patient-service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // 👈 Reactive Forms Imports
import { tap, catchError } from 'rxjs/operators';

// Assuming your Patient DTO structure looks something like this for the form patch

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.html',
  styleUrls: ['./patient-profile.css'],
  imports: [
    TitleCasePipe,
    AsyncPipe,
    CommonModule,
    ReactiveFormsModule, // 👈 IMPORTED REACTIVE FORMS HERE
  ],
})
export class PatientProfile implements OnInit {
  // Use a BehaviorSubject to hold and update patient data reactively
  private patientSubject = new BehaviorSubject<Patient | null>(null);
  patient$ = this.patientSubject.asObservable();

  isEditMode: boolean = false;
  profileForm!: FormGroup;

  errorMessage: string | null = null;
  isSaving: boolean = false;

  constructor(
    private patientService: PatientService,
    private location: Location,
    private fb: FormBuilder // 👈 Inject FormBuilder
  ) {
    // Initialize the form structure
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      // Email is often read-only, so we disable it but keep the required validator
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      // Note: Date input expects YYYY-MM-DD format, which the API should provide
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.fetchPatientData();
  }

  fetchPatientData(): void {
    this.patientService
      .getPatient()
      .pipe(
        tap((patient) => {
          this.patientSubject.next(patient);
          // Patch the form values once data is fetched and map API fields to form fields
          this.profileForm.patchValue({
            fullName: patient.name || patient.name, // Use 'fullName' or 'name' based on your object structure
            email: patient.email,
            contactNumber: patient.contactNumber,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            address: patient.address,
          });
        }),
        catchError((error) => {
          this.errorMessage = 'Failed to load patient data.';
          return of(null);
        })
      )
      .subscribe();
  }

  // --- UI Logic ---

  toggleEditMode(patientData?: Patient): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      // If cancelling, reset the form to the last saved data
      this.profileForm.patchValue(patientData as PatientDTO);
    }
    this.errorMessage = null; // Clear any previous error messages
  }

  saveProfile(): void {
    this.errorMessage = null;

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.errorMessage = 'Please correct the highlighted errors.';
      return;
    }

    this.isSaving = true;
    // getRawValue includes disabled fields (like email) if needed by the backend
    const patientDTO = this.profileForm.getRawValue() as PatientDTO;

    this.patientService
      .updatePatient(patientDTO)
      .pipe(
        tap((updatedPatient) => {
          this.patientSubject.next(updatedPatient); // Update view with fresh data
          this.toggleEditMode(); // Exit edit mode
          this.isSaving = false;
          // NOTE: Changed alert() to a simple console log for Canvas compatibility,
          // you should implement a custom modal notification in a real app.
          console.log('Profile updated successfully!');
        }),
        catchError((error) => {
          console.error('Update error:', error);
          this.errorMessage = 'Failed to update profile. Please check the network and try again.';
          this.isSaving = false;
          return of(null);
        })
      )
      .subscribe();
  }

  // --- Utility Methods ---

  formatDateOfBirth(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    // Use the component's internal date utility
    return this.location.prepareExternalUrl(
      date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    );
  }

  goBack(): void {
    this.location.back();
  }
}
