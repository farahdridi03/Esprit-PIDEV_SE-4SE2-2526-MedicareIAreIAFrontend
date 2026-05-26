// ─── Catalogue ─────────────────────────────────────────────────────────────

export interface HomeCareService {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  iconUrl: string;
  durationMinutes: number;
  active: boolean;
}

// ─── Provider Profile ───────────────────────────────────────────────────────

export interface ServiceSummary {
  id: number;
  name: string;
  category: string;
  iconUrl: string;
}

export interface ReviewDTO {
  rating: number;
  comment?: string;
  createdAt: string;
  patientName: string;
}

/** ProviderProfileDTO — retourné par /providers/{id}/profile et /services/{id}/providers */
export interface ProviderProfileDTO {
  id: number;
  fullName: string;
  bio?: string;
  profilePictureUrl?: string;
  averageRating: number;
  totalReviews: number;
  certificationDocument?: string;
  specialties: ServiceSummary[];
  reviews?: ReviewDTO[];
}

/** Complete model (used on admin side) */
export interface ServiceProvider {
  id: number;
  user: any;
  certificationDocument: string;
  verified: boolean;
  bio: string;
  profilePictureUrl: string;
  averageRating: number;
  totalReviews: number;
  specialties: HomeCareService[];
}

// ─── Service Request ────────────────────────────────────────────────────────

export interface ServiceRequest {
  id: number;
  patient: any;
  service: HomeCareService;
  assignedProvider?: ServiceProvider;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  requestedDateTime: string;
  assignedDateTime?: string;
  completedAt?: string;
  address: string;
  patientNotes?: string;
  providerNotes?: string;
  price: number;
  createdAt: string;
  reviewed?: boolean;
}

export interface CreateServiceRequestDTO {
  serviceId: number;
  providerId?: number;          // optional — patient chooses their provider
  requestedDateTime: string;
  address: string;
  patientNotes?: string;
}

export interface CompleteRequestDTO {
  providerNotes: string;
}

export interface SubmitReviewDTO {
  rating: number; // 1 to 5
  comment?: string;
}

// ─── Avis ──────────────────────────────────────────────────────────────────

export interface ServiceReview {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  patient?: { fullName: string };
  provider?: { id: number };
}

// ─── Availability ─────────────────────────────────────────────────────────

export interface ProviderAvailability {
  id: number;
  provider?: ServiceProvider;
  dayOfWeek?: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;   // HH:mm:ss
  endTime: string;     // HH:mm:ss
  available: boolean;
  specificDate?: string; // YYYY-MM-DD — null = repeated rule, non-null = one-time exception
}

export interface AvailabilityDTO {
  dayOfWeek?: string;
  startTime: string;
  endTime: string;
  available: boolean;
  specificDate?: string; // YYYY-MM-DD
}

/** Available slot calculated on backend side */
export interface AvailableSlot {
  date: string;        // YYYY-MM-DD
  dayOfWeek: string;
  startTime: string;   // HH:mm:ss
  endTime: string;     // HH:mm:ss
}

export interface CalendarEvent {
  id?: number;
  start: string;     // ISO String or LocalDateTime string
  end: string;
  title: string;
  type: 'AVAILABLE' | 'BUSY' | 'REQUEST' | 'BLOCKED';
  status?: string;   // For REQUEST type
  patientName?: string;
  requestId?: number;
}
