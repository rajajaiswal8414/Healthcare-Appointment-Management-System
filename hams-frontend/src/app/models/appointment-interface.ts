import { DoctorResponseDTO } from './doctor-interface';

export interface AppointmentDTO {
  doctorId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface AppointmentResponseDTO {
  appointmentId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: string;
  patient: PatientResponseDTO;
  doctor: DoctorResponseDTO;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientResponseDTO {
  patientId: number;
  name: string;
  email: string;
  contactNumber: string;
  address: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup: string;
}
