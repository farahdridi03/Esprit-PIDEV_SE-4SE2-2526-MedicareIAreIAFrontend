export interface Notification {
  id: number;
  message: string;
  type: string;
  targetId: number;
  participationId?: number;
  eventTitle?: string;
  eventDate?: string;
  participationStatus?: string; // PENDING, CONFIRMED, REJECTED
  isRead: boolean;
  createdAt: string;
  senderName: string;
}
