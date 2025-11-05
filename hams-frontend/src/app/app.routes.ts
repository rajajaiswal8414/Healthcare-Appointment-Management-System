import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

// --- Import all components and layouts used in the routes ---
import { PublicLayout } from './layouts/public-layout/public-layout';
import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';

export const routes: Routes = [
  // 1. Public routes (Landing Page)
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/landing/landing').then((m) => m.Landing),
        title: 'MediCare - Home',
      },
      // You can add other public pages here (e.g., /about, /contact)
    ],
  },

  // 2. Authentication routes (Login, Register)
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
        title: 'Login',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/patient-register/patient-register').then(
            (m) => m.PatientRegister
          ),
        title: 'Patient Registration',
      },
    ],
  },

  // 3. Patient Dashboard (Protected)
  {
    path: 'patient',
    component: DashboardLayout,
    canActivate: [authGuard],
    data: { role: 'PATIENT' }, // Used in your AuthGuard for role checking
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/patient/patient-dashboard/patient-dashboard').then(
            (m) => m.PatientDashboard
          ),
        title: 'Patient Dashboard',
      },
      {
        path: 'my-appointments',
        loadComponent: () =>
          import('./features/patient/my-appointments/my-appointments').then(
            (m) => m.MyAppointments
          ),
        title: 'My Appointments',
      },
      {
        path: 'find-doctors',
        loadComponent: () =>
          import('./features/patient/find-doctor/find-doctor').then((m) => m.FindDoctorComponent),
        title: 'Find Doctors',
      },
      {
        path: 'medical-records',
        loadComponent: () =>
          import('./features/patient/medical-record/medical-record').then((m) => m.MedicalRecord),
        title: 'Medical Records',
      },
      {
        path: 'patient-profile',
        loadComponent: () =>
          import('./features/patient/patient-profile/patient-profile').then(
            (m) => m.PatientProfile
          ),
        title: 'Patient Profile',
      },
      // Add other patient sub-routes here
    ],
  },

  // 4. Doctor Dashboard (Protected)
  {
    path: 'doctor',
    component: DashboardLayout,
    canActivate: [authGuard],
    data: { role: 'DOCTOR' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/doctor/doctor-dashboard/doctor-dashboard').then(
            (m) => m.DoctorDashboard
          ),
        title: 'Doctor Dashboard',
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/doctor/doctor-appointments/doctor-appointments').then(
            (m) => m.DoctorAppointments
          ),
        title: 'Appointments',
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./features/doctor/patient-management/patient-management').then(
            (m) => m.PatientManagement
          ),
        title: 'Patient Management',
      },
      {
        path: 'availability',
        loadComponent: () =>
          import('./features/doctor/doctor-availability/doctor-availability').then(
            (m) => m.DoctorAvailability
          ),
        title: 'Doctor Availability',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/doctor/doctor-profile/doctor-profile').then((m) => m.DoctorProfile),
        title: 'Doctor Profile',
      },
      {
        path: 'medical-record',
        loadComponent: () =>
          import('./features/doctor/medical-record/medical-record').then(
            (m) => m.DoctorMedicalRecords
          ),
        title: 'Doctor Medical Record',
      },
    ],
  },

  // 5. Admin Dashboard (Protected)
  {
    path: 'admin',
    component: DashboardLayout,
    canActivate: [authGuard],
    data: { role: 'ADMIN' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
        title: 'Admin Dashboard',
      },
    ],
  },

  // 6. Generic Dashboard Redirect
  {
    path: 'dashboard',
    canActivate: [authGuard],
    children: [], // This route is handled by the AuthGuard to redirect users based on their role (PATIENT, DOCTOR, ADMIN)
  },

  // 7. Wildcard route (404/Redirect)
  {
    path: '**',
    redirectTo: '', // Redirects unknown paths back to the home/landing page
    pathMatch: 'full',
  },
];
