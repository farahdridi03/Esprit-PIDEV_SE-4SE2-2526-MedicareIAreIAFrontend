export type ConsultationMode = 'OFFICE' | 'ONLINE' | 'BOTH';

export interface TimeSlot {
  startTime: string; // "09:00"
  endTime: string;   // "12:00"
  mode: ConsultationMode;
}

export interface DaySchedule {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  active: boolean;
  timeSlots: TimeSlot[];
}

export interface WeeklySchedule {
  providerId: number;
  days: DaySchedule[];
}

export type ExceptionType = 'TIME_OFF' | 'ABSENCE' | 'HOLIDAY' | 'PARTIAL_AVAILABILITY';

export interface ScheduleException {
  id?: number;
  providerId: number;
  startDate: string; // ISO date "2024-04-10"
  endDate: string;   // ISO date "2024-04-15"
  type: ExceptionType;
  reason: string;
  isAvailable: boolean; // false for full days absent
  timeSlots?: TimeSlot[]; // For 'PARTIAL_AVAILABILITY': available only some hours
}

export type AvailabilityStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED';

export interface CalendarAvailability {
  id?: number;
  startTime: string; // ISO 8601: "2026-03-21T09:00:00"
  endTime: string;   // ISO 8601: "2026-03-21T09:30:00"
  mode: 'ONLINE' | 'OFFICE' | 'BOTH';
  status: AvailabilityStatus;
  calendarId?: number;
}
