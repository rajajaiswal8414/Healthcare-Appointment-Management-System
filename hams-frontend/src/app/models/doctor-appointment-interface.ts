export interface Patient {
  patientId: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
}

export interface Doctor {
  doctorId: number;
  doctorName: string;
  specialization: string;
  qualification: string;
  clinicAddress: string;
  yearOfExperience: number;
  contactNumber: string;
  email: string;
}

export interface Appointment {
  appointmentId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  patient: Patient;
  doctor: Doctor;
}
