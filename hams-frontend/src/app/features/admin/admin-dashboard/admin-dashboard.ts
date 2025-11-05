// admin-dashboard.component.ts - UPDATED
import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DoctorRegister } from '../../auth/register/doctor-register/doctor-register';
import { AdminService, Doctor, DoctorUpdateRequest } from '../../../core/services/admin-service';
import { AdminAuthService } from '../../../core/services/admin-auth-service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, DoctorRegister, ReactiveFormsModule],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);
  private adminAuthService = inject(AdminAuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  recentDoctors: Doctor[] = [];
  showDoctorRegister = false;
  showUpdateDoctor = false;
  isLoading = true;
  isUpdating = false;
  updateError = '';
  selectedDoctor: Doctor | null = null;

  updateDoctorForm: FormGroup;

  // Dropdown states
  showProfile = false;

  // Current admin data
  currentAdmin: any;

  constructor() {
    this.updateDoctorForm = this.fb.group({
      contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      yearOfExperience: ['', [Validators.required, Validators.min(0), Validators.max(50)]],
      clinicAddress: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit() {
    this.loadCurrentAdmin();
    this.loadDashboardData();
  }

  loadCurrentAdmin() {
    this.currentAdmin = this.adminAuthService.getCurrentAdmin();
  }

  loadDashboardData() {
    this.isLoading = true;

    // First test backend connectivity
    console.log('🔍 Testing backend connectivity...');
    this.adminService.testBackendHealth().subscribe({
      next: (response) => {
        console.log('✅ Backend is reachable:', response);
        this.loadDoctors();
      },
      error: (error) => {
        console.error('❌ Backend connectivity test failed:', error);
        console.error('Backend test error details:', {
          status: error.status,
          message: error.message,
          url: error.url,
        });
        // Still try to load doctors even if health check fails
        this.loadDoctors();
      },
    });
  }

  private loadDoctors() {
    // Load doctors
    this.adminService.getRecentDoctors().subscribe({
      next: (doctors) => {
        console.log('✅ Recent doctors loaded:', doctors);
        console.log(
          'Doctor data structure:',
          doctors.map((d) => ({
            id: d.id,
            doctorId: d.doctorId,
            userId: d.userId,
            doctorName: d.doctorName,
          }))
        );
        this.recentDoctors = doctors;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading recent doctors:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
        });

        // Check if it's a 500 error - likely backend issue
        if (error.status === 500) {
          console.error('🚨 Backend 500 error - possible issues:');
          console.error('1. Backend endpoint /api/admin/doctors/recent might not exist');
          console.error('2. Backend might have a bug in the doctors endpoint');
          console.error('3. Database connection issue');
          console.error('4. Authentication/authorization issue in backend');
        }

        // Try to load all doctors as fallback
        this.loadAllDoctorsAsFallback();
        this.handleApiError(error);
      },
    });
  }

  private handleApiError(error: any) {
    if (error.status === 401) {
      this.adminAuthService.logout();
    }
  }

  private loadAllDoctorsAsFallback() {
    console.log('🔄 Attempting to load all doctors as fallback...');
    this.adminService.getAllDoctors().subscribe({
      next: (doctors) => {
        console.log('✅ Fallback: Loaded all doctors successfully:', doctors);
        console.log(
          'Fallback doctor data structure:',
          doctors.map((d) => ({
            id: d.id,
            doctorId: d.doctorId,
            userId: d.userId,
            doctorName: d.doctorName,
          }))
        );
        // Take the first 5 doctors as "recent"
        this.recentDoctors = doctors.slice(0, 5);
        this.isLoading = false;
      },
      error: (fallbackError) => {
        console.error('❌ Fallback also failed:', fallbackError);
        console.error('Fallback error details:', {
          status: fallbackError.status,
          message: fallbackError.message,
          url: fallbackError.url,
        });
        this.recentDoctors = []; // Empty array if both fail
        this.isLoading = false;
      },
    });
  }

  // Update Doctor Methods
  openUpdateDoctor(doctor: Doctor) {
    console.log('Opening update for doctor:', doctor);

    // Validate doctor ID - use doctorId as primary, fallback to id
    const doctorId = doctor.doctorId ?? doctor.id;
    if (!doctorId || isNaN(doctorId)) {
      console.error('Invalid doctor ID:', {
        doctorId,
        id: doctor.id,
        doctorIdField: doctor.doctorId,
      });
      this.updateError = 'Invalid doctor ID';
      return;
    }

    this.selectedDoctor = doctor;
    this.updateDoctorForm.patchValue({
      contactNumber: doctor.contactNumber,
      yearOfExperience: doctor.yearOfExperience,
      clinicAddress: doctor.clinicAddress,
    });
    this.showUpdateDoctor = true;
    this.updateError = '';
  }

  closeUpdateDoctor() {
    this.showUpdateDoctor = false;
    this.selectedDoctor = null;
    this.updateDoctorForm.reset();
    this.updateError = '';
    this.isUpdating = false;
  }

  showToastDoctorUpdateSuccess(doctorName: string) {
    toast.success('Profile Updated Successfully', {
      description: 'The changes for Dr. ' + doctorName + ' have been saved.',
    });
  }

  onUpdateDoctor() {
    if (this.updateDoctorForm.valid && this.selectedDoctor) {
      this.isUpdating = true;
      this.updateError = '';

      const updateData: DoctorUpdateRequest = {
        contactNumber: this.updateDoctorForm.value.contactNumber,
        yearOfExperience: this.updateDoctorForm.value.yearOfExperience,
        clinicAddress: this.updateDoctorForm.value.clinicAddress,
      };

      const doctorId = this.selectedDoctor.doctorId ?? this.selectedDoctor.id;
      console.log('🔄 Updating doctor with ID:', doctorId);

      this.adminService.updateDoctor(doctorId, updateData).subscribe({
        next: (response) => {
          this.isUpdating = false;
          console.log('✅ Doctor updated successfully:', response);

          const doctorName = this.selectedDoctor?.doctorName ?? 'Doctor';
          this.showToastDoctorUpdateSuccess(doctorName);

          this.closeUpdateDoctor();
          // Refresh the doctors list to show updated data
          this.loadDashboardData();
        },
        error: (error) => {
          this.isUpdating = false;
          console.error('❌ Error updating doctor:', error);
          console.error('Error details:', {
            status: error.status,
            message: error.message,
            doctorId: doctorId,
            selectedDoctor: this.selectedDoctor,
          });
          this.updateError = error.error?.message || 'Failed to update doctor. Please try again.';
        },
      });
    }
  }

  showToastDeleteDoctor(doctorName: string) {
    toast.success('Deletion Successful', {
      description:
        'Dr. ' + doctorName + ' and all associated records have been removed from the system.',
    });
  }

  deleteDoctor(doctorId: number) {
    const doctorToDelete = this.recentDoctors.find((d) => (d.doctorId ?? d.id) === doctorId);
    const doctorName = doctorToDelete ? doctorToDelete.doctorName : 'Doctor';
    console.log('🗑️ Attempting to delete doctor with ID:', doctorId);
    this.adminService.deleteDoctor(doctorId).subscribe({
      next: (response) => {
        console.log('✅ Doctor deleted successfully:', response);
        // Refresh the doctors list to show updated data
        this.showToastDeleteDoctor(doctorName);
        this.loadDashboardData();
      },
      error: (error) => {
        console.error('❌ Error deleting doctor:', error);
        console.error('Delete error details:', {
          status: error.status,
          message: error.message,
          doctorId: doctorId,
        });
        toast.error('Deletion Failed', {
          description: `Could not delete Dr. ${doctorName}. Please check the server status.`,
        });
      },
    });
  }

  // Existing methods (keep all your existing methods)

  toggleProfile() {
    this.showProfile = !this.showProfile;
  }

  closeDropdowns() {
    this.showProfile = false;
  }

  openDoctorRegister() {
    this.showDoctorRegister = true;
  }

  closeDoctorRegister() {
    this.showDoctorRegister = false;
  }

  onDoctorCreated() {
    this.closeDoctorRegister();
    // Refresh the doctors list when a new doctor is added
    this.refreshDoctorsList();
  }

  private refreshDoctorsList() {
    console.log('🔄 Refreshing doctors list...');
    this.isLoading = true;

    // Try recent doctors first
    this.adminService.getRecentDoctors().subscribe({
      next: (doctors) => {
        console.log('✅ Recent doctors loaded successfully');
        this.recentDoctors = doctors;
        this.isLoading = false;
      },
      error: (error) => {
        console.log('⚠️ Recent doctors failed, trying fallback...');
        this.loadAllDoctorsAsFallback();
      },
    });
  }
  showToastAdminLogout() {
    toast.success('Logged Out', {
      description: 'You have securely signed out of the Admin Dashboard.',
    });
  }

  logout() {
    this.adminAuthService.logout();
    this.showToastAdminLogout();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  getStatusClass(status: string): string {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'ACTIVE':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'INACTIVE':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  getSpecializations(): string[] {
    return [
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
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-trigger') && !target.closest('.dropdown-content')) {
      this.closeDropdowns();
    }
  }

  // Get admin initials for profile picture
  getAdminInitials(): string {
    if (this.currentAdmin?.adminName) {
      return this.currentAdmin.adminName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();
    }
    return 'AD';
  }
}
