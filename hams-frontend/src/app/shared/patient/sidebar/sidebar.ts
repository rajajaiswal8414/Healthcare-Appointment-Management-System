import { Component, inject, Input, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { PatientAuthService } from '../../../core/services/patient-auth-service';
import { toast } from 'ngx-sonner';
import { PatientResponseDTO } from 'src/app/models/appointment-interface';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private patientAuthService = inject(PatientAuthService);
  @Input() patient: PatientResponseDTO | null = null;

  showToastLogout() {
    toast.success('Goodbye, ' + this.patient?.name + '!', {
      description: 'You have been successfully logged out.',
    });
  }

  logout() {
    this.patientAuthService.logout();
    this.showToastLogout();
  }
}
