// src/app/components/app-header/header.ts

// 🚨 IMPORTANT IMPORTS: ElementRef and HostListener added
import { Component, Input, OnInit, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Added DatePipe
import { NotificationResponseDTO } from './../../../models/notification-interface';
// Assuming your service path is correct
import { NotificationService } from '../../../core/services/patient-notification-service';
import { PatientAuthService } from '../../../core/services/patient-auth-service';
import { Router } from '@angular/router';
import { PatientResponseDTO } from '../../../models/appointment-interface';

@Component({
  selector: 'app-header',
  standalone: true,
  // DatePipe added for the template | date pipe
  imports: [CommonModule, DatePipe],
  templateUrl: './header.html',
})
export class Header implements OnInit {
  @Input() patient: PatientResponseDTO | null = null;
  @Input() notificationCount: number = 0;

  private notificationService = inject(NotificationService);
  private patientAuthService = inject(PatientAuthService);
  private router = inject(Router);
  private el = inject(ElementRef);

  showNotifications = false;
  showProfile = false;

  notifications: NotificationResponseDTO[] = [];
  loadingNotifications = false;

  ngOnInit(): void {}

  // 🚨 This handles the click outside of the component to close dropdowns
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    // Check if the clicked element is OUTSIDE this component's host element
    if (!this.el.nativeElement.contains(event.target)) {
      this.showNotifications = false;
      this.showProfile = false;
    }
    // Note: The click on the button itself is handled by toggleNotifications/toggleProfile
  }

  toggleNotifications() {
    // If notifications are open, the click will close them.
    // If notifications are closed, the click will open them and close profile.
    this.showNotifications = !this.showNotifications;
    this.showProfile = false; // Always close profile when opening/closing notifications

    if (this.showNotifications && this.notifications.length === 0) {
      this.loadNotifications();
    }
  }

  loadNotifications(): void {
    this.loadingNotifications = true;
    // ... (rest of loadNotifications logic remains the same) ...
    this.notificationService.getPatientNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.loadingNotifications = false;
      },
      error: (err) => {
        console.error('Failed to load notifications:', err);
        this.loadingNotifications = false;
      },
    });
  }

  markAllAsRead(): void {
    // ... (markAllAsRead logic remains the same) ...
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
        this.notificationCount = 0;
      },
      error: (err) => {
        console.error('Failed to mark all as read:', err);
      },
    });
  }

  toggleProfile() {
    // If profile is open, the click will close it.
    // If profile is closed, the click will open it and close notifications.
    this.showProfile = !this.showProfile;
    this.showNotifications = false; // Always close notifications when opening/closing profile
  }

  openProfile() {
    // Hide the dropdown after clicking the link
    this.showProfile = false;

    // Use the Router service to navigate to the profile route
    // NOTE: 'patient/profile' must match the path defined in your Angular routing module (app-routing.module.ts)
    this.router.navigate(['/patient/patient-profile']);
  }

  // ... (rest of getInitials remains the same) ...
  getInitials(name: string | undefined): string {
    if (!name) return 'P';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  logout() {
    this.patientAuthService.logout();
  }
}
