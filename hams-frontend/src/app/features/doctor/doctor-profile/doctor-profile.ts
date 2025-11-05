import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { DoctorService } from '../../../core/services/doctor-service';
import { BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { DoctorResponseDTO } from '../../../models/doctor-interface';

// 🔑 Define the Dummy Doctor Object for fallbacks
const DUMMY_DOCTOR: DoctorResponseDTO = {
  doctorId: 0,
  doctorName: 'Profile Unavailable',
  qualification: 'N/A',
  specialization: 'General Practice (Fallback)',
  clinicAddress: 'N/A: Error Fetching Data',
  yearOfExperience: 0,
  contactNumber: 'N/A',
  email: 'error@example.com',
};

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './doctor-profile.html',
  styleUrl: './doctor-profile.css',
})
export class DoctorProfile implements OnInit {
  // Use a BehaviorSubject to hold and update doctor data reactively
  private doctorSubject = new BehaviorSubject<DoctorResponseDTO | null>(null);
  doctor$ = this.doctorSubject.asObservable(); // Observable for the template

  errorMessage: string | null = null;

  constructor(private doctorService: DoctorService, private location: Location) {}

  ngOnInit(): void {
    this.fetchDoctorData();
  }

  /**
   * Fetches the doctor's profile data from the service.
   */
  fetchDoctorData(): void {
    this.doctorService
      .getLoggedInDoctorProfile()
      .pipe(
        tap((doctor) => {
          this.doctorSubject.next(doctor);
          this.errorMessage = null;
        }),
        catchError((error) => {
          console.error('Failed to load doctor profile:', error);
          this.errorMessage = 'Failed to load doctor profile. Using placeholder data.';
          this.doctorSubject.next(DUMMY_DOCTOR as DoctorResponseDTO); // Fallback to dummy data
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Navigates back in browser history.
   */
  goBack(): void {
    this.location.back();
  }
}
