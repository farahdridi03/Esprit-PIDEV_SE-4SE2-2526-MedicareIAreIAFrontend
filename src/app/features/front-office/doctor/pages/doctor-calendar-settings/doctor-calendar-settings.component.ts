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
    
    console.log(`[DEBUG] Initializing load for providerId: ${this.providerId}`);
    
    // In this view, we now load the SPECIFIC WEEK exceptions instead of the generic template
    this.scheduleService.getExceptions(this.providerId).subscribe({
      next: (exceptions) => {
        console.log('[DEBUG] Exceptions Loaded:', exceptions);
        this.populateForm(exceptions);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[ERROR] Failed to load schedule', err);
        this.errorMessage = 'Erreur lors du chargement du planning.';
        this.isLoading = false;
      }
    });

    // We also fetch specific slots to see if things are already in DB
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
      MONDAY: 'Lundi',
      TUESDAY: 'Mardi',
      WEDNESDAY: 'Mercredi',
      THURSDAY: 'Jeudi',
      FRIDAY: 'Vendredi',
      SATURDAY: 'Samedi',
      SUNDAY: 'Dimanche'
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

    const weekDays: any[] = [];
    const weekStartDate = this.formatDateStr(this.daysInWeek[0]); // Lundi

    const formDays = this.scheduleForm.value.days;
    formDays.forEach((day: any, i: number) => {
      // N'envoyer SEULEMENT que les jours actifs
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

    console.log('[DEBUG] Saving clean schedule specific week:', weekDays);

    this.scheduleService.saveSpecificWeek(this.providerId, weekStartDate, weekDays).subscribe({
      next: () => {
        this.successMessage = 'Votre planning a été enregistré avec succès (seulement pour cette semaine spécifique).';
        this.isSaving = false;
        
        // Wait briefly to let the user see the success message, then redirect
        setTimeout(() => {
          this.successMessage = '';
          this.navigateToCalendar.emit();
        }, 1500);
      },
      error: (err) => {
        console.error('[ERROR] Failed to save schedule', err);
        this.errorMessage = 'Une erreur est survenue lors de l\'enregistrement. Vérifiez que la console du serveur ne contient pas d\'erreurs.';
        this.isSaving = false;
      }
    });
  }

  getDateForDay(dayOfWeek: string): Date | undefined {
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return this.daysInWeek.find(d => dayNames[d.getDay()] === dayOfWeek);
  }
}
