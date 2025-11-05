// src/app/models/prescription-interface.ts

export interface Medication {
  name: string;
  dosage: string;
  instructions: string;
  durationDays: number;
}

export interface Prescription {
  id: number;
  patientId: number;
  patientName: string; // Used for display
  date: Date;
  diagnosis: string;
  medications: Medication[];
  status: 'Draft' | 'Sent';
}

// Minimal patient model for the dropdown
export interface Patient {
  patientId: number;
  name: string;
  age: number;
}
