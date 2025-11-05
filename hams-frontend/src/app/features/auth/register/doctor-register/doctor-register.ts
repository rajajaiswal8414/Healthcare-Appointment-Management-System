// doctor-register.component.ts
import { Component, inject, input, output, EventEmitter, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthDoctorRequest } from '../../../../models/auth-doctor-interface';
import { AdminService } from '../../../../core/services/admin-service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-doctor-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './doctor-register.html',
})
export class DoctorRegister implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AdminService);
  private router = inject(Router);

  // Inputs and Outputs
  isOpen = input.required<boolean>();
  specializations = input.required<string[]>();
  close = output<void>();
  doctorCreated = output<void>();

  registerForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword = false;
  showConfirm = false;

  // Default specializations in case input is not provided
  defaultSpecializations: string[] = [
    'Cardiology',
    'Dermatology',
    'Orthopedics',
    'Pediatrics',
    'Neurology',
    'Psychiatry',
    'Dentistry',
    'Ophthalmology',
    'Gynecology',
    'General Surgery',
    'Internal Medicine',
    'Emergency Medicine',
  ];

  constructor() {
    this.registerForm = this.createForm();
  }

  ngOnInit() {
    // Initialize with default specializations if none provided
    if (!this.specializations() || this.specializations().length === 0) {
      // We can't directly assign to input(), so we'll handle this in the template
      console.log('Using default specializations');
    }
  }

  // Custom Validator for Password Match
  private passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private createForm(): FormGroup {
    return this.fb.group(
      {
        doctorName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        contactNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],

        // Doctor specific fields from DTO
        qualification: ['', [Validators.required]],
        specialization: ['', [Validators.required]],
        yearOfExperience: ['', [Validators.required, Validators.min(0)]],
        clinicAddress: ['', [Validators.required, Validators.minLength(10)]],

        username: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  get passwordMismatch(): boolean {
    return (
      this.registerForm.errors?.['passwordMismatch'] &&
      this.registerForm.get('confirmPassword')?.touched
    );
  }

  get f() {
    return this.registerForm.controls;
  }

  // Get the actual specializations to use (input or defaults)
  get availableSpecializations(): string[] {
    const inputSpecs = this.specializations();
    return inputSpecs && inputSpecs.length > 0 ? inputSpecs : this.defaultSpecializations;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirm() {
    this.showConfirm = !this.showConfirm;
  }

  closeModal() {
    this.close.emit();
  }

  showToastRegistration() {
    toast.success('Registration Successful!', {
      description: 'Your new account has been created.',
    });
  }

  showToastRegistrationFailure() {
    toast.error('Registration Failed', {
      description: this.errorMessage || 'An unknown error occurred. Please try again.',
    });
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const registerRequest: AuthDoctorRequest = {
        username: this.registerForm.get('username')?.value,
        email: this.registerForm.get('email')?.value,
        password: this.registerForm.get('password')?.value,
        contactNumber: this.registerForm.get('contactNumber')?.value,
        doctorName: this.registerForm.get('doctorName')?.value,
        qualification: this.registerForm.get('qualification')?.value,
        specialization: this.registerForm.get('specialization')?.value,
        clinicAddress: this.registerForm.get('clinicAddress')?.value,
        yearOfExperience: +this.registerForm.get('yearOfExperience')?.value,
      };

      console.log('Creating doctor with admin token...', registerRequest);

      this.authService.createDoctor(registerRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Doctor created successfully:', response);
          this.doctorCreated.emit();
          this.registerForm.reset();
          this.closeModal();
          this.showToastRegistration();
        },
        error: (error) => {
          this.isLoading = false;
          this.handleRegistrationError(error);
          this.showToastRegistrationFailure();
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
  private handleRegistrationError(error: any): void {
    console.error('Doctor registration error:', error);

    if (error.status === 403) {
      this.errorMessage = 'Access denied. Admin privileges required to create doctor accounts.';
    } else if (error.status === 401) {
      this.errorMessage = 'Admin session expired. Please log in again.';
    } else if (error.status === 400) {
      this.errorMessage =
        error.error?.message || 'Invalid data provided. Please check your inputs.';
    } else if (error.status === 409) {
      this.errorMessage = 'A doctor with this email or username already exists.';
    } else if (error.status === 0) {
      this.errorMessage = 'Network error. Please check your connection and try again.';
    } else {
      this.errorMessage =
        error.error?.message || 'Doctor registration failed. Please try again later.';
    }
  }
}
