import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ScheduleService } from '../../../../../services/schedule.service';
import { AvailabilityService } from '../../../../../services/availability.service';
import { AuthService } from '../../../../../services/auth.service';
import { WeeklySchedule, DaySchedule, TimeSlot, CalendarAvailability } from '../../../../../models/schedule.model';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-doctor-calendar-settings',
  templateUrl: './doctor-calendar-settings.component.html',
  styleUrls: ['./doctor-calendar-settings.component.scss']
})
export class DoctorCalendarSettingsComponent implements OnInit {
  @Output() navigateToCalendar = new EventEmitter<void>();

  readonly MIN_HOUR = 9;
  readonly MAX_HOUR = 17;

  scheduleForm!: FormGroup;
  providerId!: number;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  selectedDate: Date = new Date();
  daysInWeek: Date[] = [];

  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private availabilityService: AvailabilityService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.providerId = this.authService.getUserId() || 1;
    this.generateWeek(this.selectedDate);
    this.initForm();
    this.loadSchedule();
  }

  initForm(): void {
    this.scheduleForm = this.fb.group({
      days: this.fb.array([])
    });
  }

  get days(): FormArray {
    return this.scheduleForm.get('days') as FormArray;
  }

  get previewSchedule(): WeeklySchedule {
    return {
      providerId: this.providerId,
      days: this.scheduleForm.value.days
    };
  }

  timeSlots(dayIndex: number): FormArray {
    return this.days.at(dayIndex).get('timeSlots') as FormArray;
  }

  loadSchedule(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.scheduleService.getExceptions(this.providerId).subscribe({
      next: (exceptions) => {
        this.populateForm(exceptions);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[ERROR] Failed to load schedule', err);
        this.errorMessage = 'Error loading schedule.';
        this.isLoading = false;
      }
    });

    this.availabilityService.getAvailabilitiesByDoctor(this.providerId).subscribe({
      next: (slots) => {
        console.log('[DEBUG] Backend Availabilities found:', slots);
      }
    });
  }

  formatDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  populateForm(exceptions: any[]): void {
    this.days.clear();
    const daysOfWeek: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[] = 
      ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    daysOfWeek.forEach((dow, i) => {
      const dateOfDOW = this.daysInWeek[i];
      const dateStr = this.formatDateStr(dateOfDOW);
      
      const exceptionForDay = exceptions.find(e => e.startDate === dateStr && e.reason === 'Semaine Spécifique');
      
      const dayFormGroup = this.fb.group({
        dayOfWeek: [dow],
        active: [exceptionForDay ? exceptionForDay.isAvailable : false],
        timeSlots: this.fb.array(
          exceptionForDay?.timeSlots?.length > 0
            ? exceptionForDay.timeSlots.map((slot: any) => this.createTimeSlotFormGroup(slot)) 
            : [this.createTimeSlotFormGroup()]
        )
      });
      this.days.push(dayFormGroup);
    });
  }

  createTimeSlotFormGroup(slot?: any): FormGroup {
    return this.fb.group({
      id: [slot?.id || null],
      startTime: [slot?.startTime || '09:00', Validators.required],
      endTime: [slot?.endTime || '12:00', Validators.required],
      mode: [slot?.mode || 'OFFICE', Validators.required]
    }, { validators: this.timeRangeValidator });
  }

  timeRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;
    if (start && end && start >= end) {
      return { 'invalidRange': true };
    }
    return null;
  }

  isPastDay(date: Date | undefined): boolean {
    if (!date) return false;
    const today = new Date();
    const dayDate = new Date(date);
    dayDate.setHours(0, 0, 0, 0);
    const todayMidnight = new Date(today);
    todayMidnight.setHours(0, 0, 0, 0);

    if (dayDate.getTime() < todayMidnight.getTime()) return true;

    if (dayDate.getTime() === todayMidnight.getTime()) {
      return today.getHours() >= this.MAX_HOUR;
    }

    return false;
  }

  isValidSlot(slot: any): boolean {
    if (!slot.startTime || !slot.endTime) return false;
    const [h1, m1] = slot.startTime.split(':').map(Number);
    const [h2, m2] = slot.endTime.split(':').map(Number);
    return (h1 * 60 + m1) < (h2 * 60 + m2);
  }

  getSlotError(slot: any): string | null {
    if (!slot.startTime || !slot.endTime) return null;
    const [sh, sm] = slot.startTime.split(':').map(Number);
    const [eh, em] = slot.endTime.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;

    if (eh > 17 || (eh === 17 && em > 0)) {
      return "End time cannot exceed 17:00 (maximum allowed hour).";
    }
    if (endMins === 0) {
      return "Please select a valid end time (max 17:00).";
    }
    if (endMins <= startMins) {
      return "End time must be after start time.";
    }
    return null;
  }

  isWithinAllowedHours(slot: any): boolean {
    if (!slot.startTime || !slot.endTime) return false;
    const [sh, sm] = slot.startTime.split(':').map(Number);
    const [eh, em] = slot.endTime.split(':').map(Number);
    
    const isStartValid = sh >= this.MIN_HOUR;
    const isEndValid = eh < this.MAX_HOUR || (eh === this.MAX_HOUR && em === 0);
    
    return isStartValid && isEndValid;
  }

  hasSlotError(dayIndex: number, slotIndex: number): boolean {
    const slot = this.timeSlots(dayIndex).at(slotIndex);
    
    const isInvalidRange = !this.isValidSlot(slot.value);
    const isOutsideHours = !this.isWithinAllowedHours(slot.value);
    
    return (slot.invalid || isInvalidRange || isOutsideHours) && (slot.dirty || slot.touched);
  }

  addTimeSlot(dayIndex: number): void {
    const dayControl = this.days.at(dayIndex);
    const date = this.getDateForDay(dayControl.get('dayOfWeek')?.value);
    
    if (this.isPastDay(date)) return;

    const timeSlots = this.timeSlots(dayIndex);
    const startTime = '09:00';
    const endTime = '17:00';
    
    timeSlots.push(this.fb.group({
      id: [null],
      startTime: [startTime, Validators.required],
      endTime: [endTime, Validators.required],
      mode: ['OFFICE', Validators.required]
    }));
  }

  private addOneHour(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const newH = (h + 1) % 24;
    return `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  removeTimeSlot(dayIndex: number, slotIndex: number): void {
    const date = this.getDateForDay(this.days.at(dayIndex).get('dayOfWeek')?.value);
    if (this.isPastDay(date)) return;
    this.timeSlots(dayIndex).removeAt(slotIndex);
  }

  toggleDay(dayIndex: number): void {
    const dayControl = this.days.at(dayIndex).get('active');
    const date = this.getDateForDay(this.days.at(dayIndex).get('dayOfWeek')?.value);
    if (this.isPastDay(date)) return;
    dayControl?.setValue(!dayControl.value);
  }

  getDayName(dayOfWeek: string): string {
    const names: Record<string, string> = {
      MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday',
      THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday'
    };
    return names[dayOfWeek] || dayOfWeek;
  }

  generateWeek(baseDate: Date): void {
    const startOfWeek = new Date(baseDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
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

  saveSchedule(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    const formDays = this.scheduleForm.value.days;
    
    const hasInvalidHours = formDays.some((d: any) => 
      d.active && d.timeSlots.some((s: any) => !this.isWithinAllowedHours(s))
    );

    if (hasInvalidHours) {
      this.errorMessage = "All slots must be between 09:00 and 17:00.";
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const hasInvalidSlot = formDays.some((d: any) => 
      d.active && d.timeSlots.some((s: any) => !this.isValidSlot(s))
    );

    if (hasInvalidSlot) {
      this.errorMessage = "Please fix invalid time slots before saving.";
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const weekDays: any[] = [];
    const weekStartDate = this.formatDateStr(this.daysInWeek[0]);

    formDays.forEach((day: any, i: number) => {
      if (day.active) {
        const dateStr = this.formatDateStr(this.daysInWeek[i]);
        weekDays.push({
          providerId: this.providerId,
          startDate: dateStr,
          endDate: dateStr,
          type: 'PARTIAL_AVAILABILITY',
          reason: 'Semaine Spécifique',
          isAvailable: true,
          timeSlots: day.timeSlots.map(({ id, ...slot }: any) => slot)
        });
      }
    });

    this.scheduleService.saveSpecificWeek(this.providerId, weekStartDate, weekDays).subscribe({
      next: () => {
        this.successMessage = 'Your schedule has been successfully saved.';
        this.isSaving = false;
        setTimeout(() => {
          this.successMessage = '';
          this.navigateToCalendar.emit();
        }, 1500);
      },
      error: (err) => {
        console.error('[ERROR] Failed to save schedule', err);
        this.errorMessage = 'An error occurred while saving.';
        this.isSaving = false;
      }
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  getDateForDay(dayOfWeek: string): Date | undefined {
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return this.daysInWeek.find(d => dayNames[d.getDay()] === dayOfWeek);
  }
}
