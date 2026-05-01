export type EventType = 'ONLINE' | 'PHYSICAL';
export type RegistrationStatus = 'REGISTERED' | 'VALIDATED' | 'PENDING' | 'CONFIRMED' | 'REJECTED';

export interface MedicalEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  eventType: EventType;
  createdById?: number;
  
  // Physical Event Details
  venueName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  capacity?: number;
  
  // Online Event Details
  platformName?: string;
  meetingLink?: string;
  meetingPassword?: string;
  
  // Custom Fields for UI
  imageUrl?: string;
  attendeeImages?: string[]; // Optional: URLs of participant avatars
  ticketPrice?: number;
}

export interface EventRegistration {
  id: number;
  eventId: number;
  participantId?: number; // Old field
  userId?: number;       // New field from ParticipationResponse
  userFullName?: string;
  userEmail?: string;
  status: RegistrationStatus;
  createdAt?: string;     // Old field
  registeredAt?: string;  // New field
  attended?: boolean;
}

export interface EventRegistrationRequest {
  eventId: number;
  participantId: number;
}

export type SeatStatus = 'AVAILABLE' | 'RESERVED' | 'BLOCKED';

export interface EventSeat {
  id: number;
  eventId: number;
  zoneName: string;
  seatLabel: string;
  posX: number;
  posY: number;
  status: SeatStatus;
  reservedByFullName?: string;
}

export interface SaveSeatRequest {
  id?: number;
  zoneName: string;
  seatLabel: string;
  posX: number;
  posY: number;
  status: SeatStatus;
}

export interface SeatZoneSummary {
  zoneName: string;
  totalSeats: number;
  availableSeats: number;
  reservedSeats: number;
  blockedSeats: number;
}

export interface EventAnalytics {
  eventId: number;
  eventTitle: string;
  totalRegistrations: number;
  actualAttendance: number;
  attendanceRate: number;
  averageSatisfaction: number;
  totalRevenue: number;
  attendanceDrift: number;
  satisfactionDrift: number;
  recommendations: string[];
}
