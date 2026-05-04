// src/app/models/notification.model.ts

export interface NotificationDTO {
  id: number;
  doctorId: number;
  appointmentId: number;
  message: string;
  read: boolean;
  createdAt: string; // ISO 8601
}
