import { DoctorResponseDTO } from './../../../models/doctor-interface';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { DoctorAuthService } from 'src/app/core/services/doctor-auth-service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  constructor(private doctorAuthService: DoctorAuthService) {}
  @Input() doctor: DoctorResponseDTO | null = null;

  showToastLogout() {
    toast.success('Goodbye, ' + this.doctor?.doctorName + '!', {
      description: 'You have been successfully logged out.',
    });
  }
  logout() {
    this.doctorAuthService.logout();
    this.showToastLogout();
  }
}
