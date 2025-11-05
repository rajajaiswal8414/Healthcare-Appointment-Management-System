export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',

  auth: {
    register: '/auth/register',
    login: '/auth/login',
  },

  admin: {
    doctorRegister: '/admin/create-user',
    doctorLogin: '/auth/login',
    adminLogin: '/auth/login',
    getAllDoctors: '/patients/all-doctors',
    updateDoctor: '/admin/doctors/{doctorId}',
    deleteDoctor: '/admin/doctors/{doctorId}',
  },

  patient: {
    getAvailableDoctors: '/patients/doctors-availability',
    getMedicalRecords: '/patients/me/medical-records',
    getNotifications: '/patients/me/notifications',
    addAppointments: '/patients/me/appointments',
    getAppointments: '/patients/me/status',
    updateAppointment: '/patients/me/appointments/{appointmentId}',
    cancelAppointment: '/appointments/{appointmentId}/cancel',
    getPatient: '/patients/me',
    updatePatient: '/patients/me',
    searchDoctors: '/patients/doctor-name?specialty={specialty}&name={name}',
    getAllDoctors: '/patients/all-doctors',
  },

  doctor: {
    addRecord: '/doctors/me/medical-records',
    getMedicalRecords: '/doctors/me/medical-records',
    getNotifications: '/doctors/me/notifications',
    getDoctor: '/doctors/me',
    addAvailability: '/doctors/me/availability',
    getAvailability: '/doctors/me/availability',
    updateAvailability: '/doctors/{doctorId}/availability/{availabilityId}',
    confirmAppointment: '/doctors/me/appointments/{appointmentId}/confirm',
    rejectAppointment: '/doctors/me/appointments/{appointmentId}/reject',
  },
};
