import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ScheduleService } from '../../../../../services/schedule.service';
import { AuthService } from '../../../../../services/auth.service';
import { WeeklySchedule, ScheduleException, DaySchedule } from '../../../../../models/schedule.model';

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

  constructor(
    private scheduleService: ScheduleService,
    private authService: AuthService
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
    this.scheduleService.getWeeklySchedule(this.providerId).subscribe({
      next: (schedule) => {
        this.weeklySchedule = schedule;
        this.loadExceptions();
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
    // 1. Check exceptions first (Specific date override)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const exception = this.exceptions.find(ex => dateStr >= ex.startDate && dateStr <= ex.endDate);
    
    if (exception) {
      return {
        dayOfWeek: 'MONDAY', // Dummy value not used for rendering
        active: exception.isAvailable,
        timeSlots: exception.timeSlots || []
      };
    }

    // 2. Fallback to weekly template
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return this.weeklySchedule?.days.find(d => d.dayOfWeek === dayNames[date.getDay()]);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  }
}
