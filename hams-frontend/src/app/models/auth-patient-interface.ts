export interface AuthPatientRequest {
  username: string;
  password: string;
  name: string;
  dateOfBirth: string; // ISO date string
  gender: string;
  contactNumber: string;
  email: string;
  address: string;
  bloodGroup: string;
}

export interface AuthPatientResponse {
  token: string;
  type: 'Bearer';
  patient: Patient;
}

export interface AuthPatientLogin {
  username: string;
  password: string;
}

export interface Patient {
  patientId: number;
  name: string;
  email: string;
  contactNumber: string;
  address: string;
  gender: string;
  dateOfBirth: string; // ISO date string
  bloodGroup: string; // ISO date string
}
