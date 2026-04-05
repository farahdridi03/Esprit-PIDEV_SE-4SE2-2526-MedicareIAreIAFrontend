export interface AvailableSlot {
  providerId: number;
  startTime: string; // ISO string 2026-03-25T09:00:00
  endTime: string;   // ISO string
  mode: 'ONLINE' | 'IN_PERSON' | 'BOTH';
  status: 'AVAILABLE' | 'BOOKED';
}
