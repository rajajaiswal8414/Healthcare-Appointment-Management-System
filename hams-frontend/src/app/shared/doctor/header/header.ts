import { Doctor } from './../../../models/doctor-appointment-interface';
// src/app/components/doctor-header/doctor-header.component.ts

import {
  Component,
  Input,
  OnInit,
  inject,
  ElementRef,
  HostListener,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationResponseDTO } from './../../../models/notification-interface';
// Assuming you have separate services for doctor-specific logic
import { DoctorNotificationService } from '../../../core/services/doctor-notification-service';
import { DoctorAuthService } from '../../../core/services/doctor-auth-service';
import { DoctorResponseDTO } from '../../../models/doctor-interface';

@Component({
  selector: 'app-doctor-header',
  standalone: true,
  // DatePipe added for the template | date pipe
  imports: [CommonModule, DatePipe],
  templateUrl: './header.html',
  // You might want a separate CSS file for the header styles, or use the existing doctor-dashboard.css if it's broad.
})
export class DoctorHeader implements OnInit {
  // 🔑 Input property for the doctor profile data
  @Input() doctor: DoctorResponseDTO | null = null;
  @Input() notificationCount: number = 0; // Use a placeholder or bound value from parent dashboard
  @Output() logoutEvent = new EventEmitter<void>();

  private notificationService = inject(DoctorNotificationService); // 🔑 Doctor's notification service
  private doctorAuthService = inject(DoctorAuthService); // 🔑 Doctor's auth service
  private router = inject(Router);
  private el = inject(ElementRef);

  showNotifications = false;
  showProfile = false;

  notifications: NotificationResponseDTO[] = [];
  loadingNotifications = false;

  // 💡 Note: If you want to use the actual notification count,
  // you should load it in the parent DoctorDashboard and pass it as an Input.
  // The loadNotifications method below fetches the full list on dropdown open.

  ngOnInit(): void {
    // If the parent component (DoctorDashboard) already loaded the count,
    // you might not need to do anything here.
  }

  // 🚨 This handles the click outside of the component to close dropdowns
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    // Check if the clicked element is OUTSIDE this component's host element
    if (!this.el.nativeElement.contains(event.target)) {
      this.showNotifications = false;
      this.showProfile = false;
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showProfile = false; // Close profile dropdown

    // Load notifications only when opening and if they haven't been loaded yet
    if (this.showNotifications && this.notifications.length === 0) {
      this.loadNotifications();
    }
  }

  loadNotifications(): void {
    this.loadingNotifications = true;
    this.notificationService.getNotifications().subscribe({
      // 🔑 Call doctor-specific API
      next: (data) => {
        this.notifications = data;
        this.loadingNotifications = false;
      },
      error: (err) => {
        console.error('Failed to load doctor notifications:', err);
        this.loadingNotifications = false;
        // Optionally display a generic error notification in the list
        this.notifications = [];
      },
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      // 🔑 Call doctor-specific API
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
    this.showProfile = !this.showProfile;
    this.showNotifications = false; // Close notifications dropdown
  }

  openProfile() {
    this.showProfile = false;
    // 🔑 Navigate to the doctor profile route
    this.router.navigate(['/doctor/profile']);
  }

  getInitials(name: string | undefined): string {
    if (!name) return 'Dr';
    return name
      .split(' ')
      .filter((n) => n.length > 0) // Filter out empty strings from multiple spaces
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  logout() {
    this.logoutEvent.emit();
  }
}
