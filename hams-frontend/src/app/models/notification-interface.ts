export interface NotificationResponseDTO {
  id: number;
  appointmentId: number;
  recipientType: string;
  recipientId: number;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}
