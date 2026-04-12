export type EventType = 'ONLINE' | 'PHYSICAL';
export type RegistrationStatus = 'REGISTERED' | 'VALIDATED';

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
}

export interface EventRegistration {
  id: number;
  eventId: number;
  participantId: number;
  status: RegistrationStatus;
  createdAt: string;
}

export interface EventRegistrationRequest {
  eventId: number;
  participantId: number;
}