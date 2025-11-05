import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PatientAuthService } from '../../../../core/services/patient-auth-service';
import { Router, RouterLink } from '@angular/router';
import { AuthPatientRequest } from '../../../../models/auth-patient-interface';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-patient-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink], // Add necessary modules
  templateUrl: './patient-register.html',
  styleUrl: './patient-register.css',
})
export class PatientRegister {
  private fb = inject(FormBuilder);
  private authService = inject(PatientAuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword = false;
  showConfirm = false;

  constructor() {
    this.registerForm = this.createForm();
  }

  // Custom Validator for Password Match
  private passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      // The error is set on the main control (the Form Group)
      return { passwordMismatch: true };
    }
    return null;
  }

  private createForm(): FormGroup {
    return this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        contactNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
        dateOfBirth: ['', [Validators.required]],
        gender: ['', [Validators.required]],
        bloodGroup: [''], // Optional in the UI, but part of the request interface
        address: ['', [Validators.required, Validators.minLength(10)]],
        username: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    ); // Apply the custom validator here
  }

  // Helper to check for password mismatch error
  get passwordMismatch(): boolean {
    return (
      this.registerForm.errors?.['passwordMismatch'] &&
      this.registerForm.get('confirmPassword')?.touched
    );
  }

  // Helper for form control access in the template
  get f() {
    return this.registerForm.controls;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirm() {
    this.showConfirm = !this.showConfirm;
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

  // Renamed to onSubmit to match common convention, but you can use onRegister
  onRegister(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const registerRequest: AuthPatientRequest = {
        username: this.registerForm.get('username')?.value,
        email: this.registerForm.get('email')?.value,
        password: this.registerForm.get('password')?.value,
        gender: this.registerForm.get('gender')?.value,
        contactNumber: this.registerForm.get('contactNumber')?.value,
        address: this.registerForm.get('address')?.value,
        // The form control name is 'bloodGroup' (camelCase)
        bloodGroup: this.registerForm.get('bloodGroup')?.value,
        dateOfBirth: this.registerForm.get('dateOfBirth')?.value,
        name: this.registerForm.get('name')?.value,
      };

      this.authService.register(registerRequest).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/auth/login']);
          this.showToastRegistration();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          console.error('Registration error:', error);
          this.showToastRegistrationFailure();
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
