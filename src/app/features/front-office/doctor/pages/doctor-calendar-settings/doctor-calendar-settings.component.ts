import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ScheduleService } from '../../../../../services/schedule.service';
import { AuthService } from '../../../../../services/auth.service';
import { WeeklySchedule } from '../../../../../models/schedule.model';

@Component({
  selector: 'app-doctor-calendar-settings',
  templateUrl: './doctor-calendar-settings.component.html',
  styleUrls: ['./doctor-calendar-settings.component.scss']
})
export class DoctorCalendarSettingsComponent implements OnInit {
  @Output() navigateToCalendar = new EventEmitter<void>();

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

    this.scheduleService.getWeeklySchedule(this.providerId).subscribe({
      next: (schedule) => {
        this.populateFromWeeklySchedule(schedule);
        this.isLoading = false;
      },
      error: () => {
        // No schedule saved yet — show empty form
        this.populateFromWeeklySchedule(null);
        this.isLoading = false;
      }
    });
  }

  formatDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  populateFromWeeklySchedule(schedule: any): void {
    this.days.clear();
    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    daysOfWeek.forEach((dow) => {
      const savedDay = schedule?.days?.find((d: any) => d.dayOfWeek === dow);

      const dayFormGroup = this.fb.group({
        dayOfWeek: [dow],
        active: [savedDay ? savedDay.active : false],
        timeSlots: this.fb.array(
          (savedDay?.timeSlots?.length ?? 0) > 0
            ? savedDay.timeSlots.map((slot: any) => this.createTimeSlotFormGroup(slot))
            : [this.createTimeSlotFormGroup()]
        )
      });
      this.days.push(dayFormGroup);
    });
  }

  createTimeSlotFormGroup(slot?: any): FormGroup {
    return this.fb.group({
      id: [slot?.id || null], // Keep track of DB ID
      startTime: [slot?.startTime || '09:00', Validators.required],
      endTime: [slot?.endTime || '12:00', Validators.required],
      mode: [slot?.mode || 'OFFICE', Validators.required]
    });
  }

  addTimeSlot(dayIndex: number): void {
    const timeSlots = this.timeSlots(dayIndex);
    timeSlots.push(this.createTimeSlotFormGroup());
  }

  removeTimeSlot(dayIndex: number, slotIndex: number): void {
    this.timeSlots(dayIndex).removeAt(slotIndex);
  }

  toggleDay(dayIndex: number): void {
    const dayControl = this.days.at(dayIndex).get('active');
    dayControl?.setValue(!dayControl.value);
  }

  getDayName(dayOfWeek: string): string {
    const names: Record<string, string> = {
      MONDAY: 'Monday',
      TUESDAY: 'Tuesday',
      WEDNESDAY: 'Wednesday',
      THURSDAY: 'Thursday',
      FRIDAY: 'Friday',
      SATURDAY: 'Saturday',
      SUNDAY: 'Sunday'
    };
    return names[dayOfWeek] || dayOfWeek;
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

  saveSchedule(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Build the WeeklySchedule payload that maps to PUT /providers/{id}/weekly-schedule
    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const formDays = this.scheduleForm.value.days;

    const weeklySchedulePayload = {
      days: formDays.map((day: any, i: number) => ({
        dayOfWeek: daysOfWeek[i],
        active: day.active,
        enabled: day.active,
        timeSlots: day.active ? day.timeSlots.map(({ id, ...slot }: any) => slot) : []
      }))
    };

    console.log('[DEBUG] Saving weekly schedule:', JSON.stringify(weeklySchedulePayload));

    this.scheduleService.saveWeeklySchedule(this.providerId, weeklySchedulePayload as any).subscribe({
      next: () => {
        // After saving the template, trigger sync to populate CalendarAvailability records
        this.scheduleService.syncCalendar(this.providerId).subscribe({
          next: () => {
            this.successMessage = 'Your weekly schedule has been saved! The calendar will update automatically.';
            this.isSaving = false;
            setTimeout(() => {
              this.successMessage = '';
              this.navigateToCalendar.emit();
            }, 1500);
          },
          error: () => {
            // Sync failed but save succeeded — calendar will auto-sync on load
            this.successMessage = 'Schedule saved.';
            this.isSaving = false;
            setTimeout(() => {
              this.successMessage = '';
              this.navigateToCalendar.emit();
            }, 1500);
          }
        });
      },
      error: (err) => {
        console.error('[ERROR] Failed to save schedule', err);
        this.errorMessage = 'An error occurred while saving. Please check the server console for errors.';
        this.isSaving = false;
      }
    });
  }

  getDateForDay(dayOfWeek: string): Date | undefined {
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return this.daysInWeek.find(d => dayNames[d.getDay()] === dayOfWeek);
  }
}
