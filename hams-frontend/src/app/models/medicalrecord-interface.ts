export interface MedicalRecordResponseDTO {
  recordId: number;
  patientId: number;
  doctorId: number;
  patientName: string;
  doctorName: string;
  reason: string;
  diagnosis: string;
  notes: string;
  prescriptions: PrescriptionResponseDTO[];
  createdAt: string;
}

export interface PrescriptionResponseDTO {
  prescriptionId: number;
  medicationName: string;
  dosage: string;
  instructions: string;
  prescribedAt: string;
}
