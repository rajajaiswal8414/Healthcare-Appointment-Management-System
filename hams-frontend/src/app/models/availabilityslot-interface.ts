export interface AvailabilitySlot {
  availabilityId: number;
  availableDate?: string;
  startTime: string;
  endTime: string;
}

export interface DoctorAvailabilityPayload {
  availableDate: string;
  startTime: string;
  endTime: string;
  availabilityId: number;
}
