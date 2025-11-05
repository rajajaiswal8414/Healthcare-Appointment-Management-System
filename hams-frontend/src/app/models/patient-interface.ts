export interface Patient {
  patientId: number;
  name: string;
  email: string;
  contactNumber: string;
  address: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup: string;
}

export interface PatientDTO {
  name: string;
  dateOfBirth: string;
  gender: string;
  contactNumber: string;
  email: string;
  address: string;
  bloodGroup: string;
}
