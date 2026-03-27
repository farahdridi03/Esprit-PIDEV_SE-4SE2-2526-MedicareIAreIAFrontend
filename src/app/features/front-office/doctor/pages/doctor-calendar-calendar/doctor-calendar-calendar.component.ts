import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ScheduleService } from '../../../../../services/schedule.service';
import { AuthService } from '../../../../../services/auth.service';
import { WeeklySchedule, ScheduleException, DaySchedule, CalendarAvailability } from '../../../../../models/schedule.model';
import { AvailabilityService } from '../../../../../services/availability.service';

@Component({
  selector: 'app-doctor-calendar-calendar',
  templateUrl: './doctor-calendar-calendar.component.html',
  styleUrls: ['./doctor-calendar-calendar.component.scss']
})
export class DoctorCalendarCalendarComponent implements OnInit, OnChanges {
  @Input() previewSchedule?: WeeklySchedule;
  @Input() isPreview = false;

  providerId!: number;
  weeklySchedule?: WeeklySchedule;
  selectedDate: Date = new Date();
  daysInWeek: Date[] = [];
  isLoading = false;
  exceptions: ScheduleException[] = [];
  availabilities: CalendarAvailability[] = [];

  constructor(
    private scheduleService: ScheduleService,
    private authService: AuthService,
    private availabilityService: AvailabilityService
  ) {}

  ngOnInit(): void {
    this.providerId = this.authService.getUserId() || 1;
    this.generateWeek(this.selectedDate);
    
    if (this.isPreview && this.previewSchedule) {
      this.weeklySchedule = this.previewSchedule;
    } else {
      this.loadSchedule();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isPreview && changes['previewSchedule'] && changes['previewSchedule'].currentValue) {
      this.weeklySchedule = changes['previewSchedule'].currentValue;
    }
  }

  loadSchedule(): void {
    this.isLoading = true;
    this.availabilityService.getAvailabilitiesByDoctor(this.providerId).subscribe({
      next: (slots) => {
        this.availabilities = slots;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadExceptions(): void {
    this.scheduleService.getExceptions(this.providerId).subscribe({
      next: (exceptions) => {
        this.exceptions = exceptions;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  generateWeek(baseDate: Date): void {
    const startOfWeek = new Date(baseDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    startOfWeek.setDate(diff);

    this.daysInWeek = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        this.daysInWeek.push(d);
    }
  }

  nextWeek(): void {
    this.selectedDate.setDate(this.selectedDate.getDate() + 7);
    this.generateWeek(this.selectedDate);
  }

  prevWeek(): void {
    this.selectedDate.setDate(this.selectedDate.getDate() - 7);
    this.generateWeek(this.selectedDate);
  }

  getDaySchedule(date: Date): DaySchedule | undefined {
    if (this.isPreview) {
      // 1. Fallback to weekly template for preview mode
      const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      return this.weeklySchedule?.days.find(d => d.dayOfWeek === dayNames[date.getDay()]);
    }

    // 2. Real Availabilities Mode
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Helper function to safely extract YYYY-MM-DD from either Array or String
    const getDatePart = (timeValue: any): string | null => {
      if (!timeValue) return null;
      if (Array.isArray(timeValue)) {
        // Jackson array [2026, 3, 26, 9, 0] -> "2026-03-26"
        const y = timeValue[0];
        const m = String(timeValue[1]).padStart(2, '0');
        const d = String(timeValue[2]).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      // String "2026-03-26T09:00:00"
      return typeof timeValue === 'string' ? timeValue.split('T')[0] : null;
    };

    // Filter availabilities for the exact date
    const dayAvailabilities = this.availabilities.filter(a => getDatePart(a.startTime) === dateStr);

    if (dayAvailabilities.length === 0) {
      // closed
      return {
        dayOfWeek: 'MONDAY', 
        active: false,
        timeSlots: []
      };
    }

    const getTimePart = (timeValue: any): string => {
      if (Array.isArray(timeValue)) {
        // [2026, 3, 26, 9, 30] -> "09:30"
        const h = String(timeValue[3] || 0).padStart(2, '0');
        const min = String(timeValue[4] || 0).padStart(2, '0');
        return `${h}:${min}`;
      }
      return typeof timeValue === 'string' ? timeValue.split('T')[1]?.substring(0, 5) || '00:00' : '00:00';
    };

    const timeSlots = dayAvailabilities.map(a => {
      const start = getTimePart(a.startTime);
      const end = getTimePart(a.endTime);
      
      return {
        id: a.id,
        startTime: start,
        endTime: end,
        mode: a.mode,
        status: a.status // assuming CalendarAvailability has status
      } as any;
    });

    return {
      dayOfWeek: 'MONDAY', 
      active: true,
      timeSlots: timeSlots
    };
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  }
}
