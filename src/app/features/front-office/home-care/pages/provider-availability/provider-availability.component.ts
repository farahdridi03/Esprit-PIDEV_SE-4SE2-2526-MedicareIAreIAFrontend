import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HomecareService } from '../../../../../services/homecare.service';
import { ProviderAvailability, AvailabilityDTO, CalendarEvent } from '../../../../../models/homecare.model';

@Component({
  selector: 'app-provider-availability',
  templateUrl: './provider-availability.component.html',
  styleUrls: ['./provider-availability.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProviderAvailabilityComponent implements OnInit {
  // Calendar State
  viewDate: Date = new Date();
  calendarDays: { date: Date, isCurrentMonth: boolean, events: CalendarEvent[] }[] = [];
  
  // Existing Availability State
  availabilities: ProviderAvailability[] = [];
  availabilityForm!: FormGroup;
  
  isLoading = true;
  isSubmitting = false;
  showForm = false;
  isExceptionMode = false; // Pour savoir si on édite un jour spécifique
  error = '';
  successMessage = '';
  
  weeklyTotalHours = 0;

  daysOfWeek = [
    { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' },
    { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' },
    { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' },
    { value: 'SUNDAY', label: 'Sunday' }
  ];

  constructor(
    private fb: FormBuilder,
    private homecare: HomecareService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadData();
  }

  initForm(): void {
    this.availabilityForm = this.fb.group({
      dayOfWeek: ['MONDAY', Validators.required],
      startTime: ['08:00', Validators.required],
      endTime: ['17:00', Validators.required],
      available: [true, Validators.required],
      specificDate: [null]
    });
  }

  calculateWeeklyTotals(): void {
    let totalMinutes = 0;
    // On ne compte que les règles hebdomadaires (specificDate null)
    this.availabilities.filter(a => !a.specificDate && a.available).forEach(a => {
      const [sh, sm] = a.startTime.split(':').map(Number);
      const [eh, em] = a.endTime.split(':').map(Number);
      totalMinutes += (eh * 60 + em) - (sh * 60 + sm);
    });
    this.weeklyTotalHours = Math.round(totalMinutes / 60 * 10) / 10;
  }

  loadData(): void {
    this.isLoading = true;
    this.error = '';
    
    // On utilise forkJoin ou on gère séparément mais on s'assure que isLoading finit à false
    this.loadAvailabilities();
    this.generateCalendar();
  }

  loadAvailabilities(): void {
    this.homecare.getMyAvailability().subscribe({
      next: (data) => {
        this.availabilities = data;
        this.calculateWeeklyTotals();
        this.checkLoadingState();
      },
      error: (err) => {
        console.error('Error loading availabilities', err);
        this.error = 'Erreur lors du chargement de vos horaires hebdomadaires.';
        this.checkLoadingState();
      }
    });
  }

  private loadAvailCount = 0;
  private calendarLoadCount = 0;

  private checkLoadingState(): void {
    // On simplifie pour l'instant : si l'un des deux finit, on peut déjà montrer quelque chose
    this.isLoading = false;
  }

  generateCalendar(): void {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    
    // Start of month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Calendar start (include days from previous week)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1));
    
    // Calendar end (include days to complete the last week)
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (endDate.getDay() === 0 ? 0 : 7 - endDate.getDay()));

    // Fetch events for this range
    const fromStr = this.formatDate(startDate);
    const toStr = this.formatDate(endDate);

    // Pré-générer la grille vide pour éviter l'effet "page blanche" pendant le chargement
    this.generateEmptyCalendarGrid(startDate, endDate, month);

    this.homecare.getCalendarEvents(fromStr, toStr).subscribe({
      next: (events) => {
        const days = [];
        const curr = new Date(startDate);
        while (curr <= endDate) {
          const dayDate = new Date(curr);
          const dayEvents = events.filter(e => {
            const eDate = new Date(e.start).toDateString();
            return eDate === dayDate.toDateString();
          });

          days.push({
            date: dayDate,
            isCurrentMonth: dayDate.getMonth() === month,
            events: dayEvents
          });
          curr.setDate(curr.getDate() + 1);
        }
        this.calendarDays = days;
        this.checkLoadingState();
      },
      error: (err) => {
        console.error('Error loading calendar events', err);
        this.error = 'Erreur lors du chargement du calendrier.';
        this.checkLoadingState();
        // Même en cas d'erreur, on génère la grille vide pour que l'utilisateur voie au moins les jours
        this.generateEmptyCalendarGrid(startDate, endDate, month);
      }
    });
  }

  private generateEmptyCalendarGrid(startDate: Date, endDate: Date, month: number): void {
    const days = [];
    const curr = new Date(startDate);
    while (curr <= endDate) {
      days.push({
        date: new Date(curr),
        isCurrentMonth: curr.getMonth() === month,
        events: []
      });
      curr.setDate(curr.getDate() + 1);
    }
    this.calendarDays = days;
  }

  nextMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  prevMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  handleDayClick(day: any): void {
    const isBlocked = day.events.some((e: any) => e.type === 'BLOCKED');
    const dateStr = this.formatDate(day.date);

    if (isBlocked) {
      const blockedEvent = day.events.find((e: any) => e.type === 'BLOCKED');
      if (confirm('Do you want to unblock this day?')) {
        this.isSubmitting = true;
        this.homecare.unblockDay(blockedEvent.id).subscribe({
          next: () => {
            this.successMessage = 'Day unblocked.';
            this.isSubmitting = false;
            this.generateCalendar();
          }
        });
      }
    } else {
      // Proposer de bloquer OU de définir des heures
      const choice = confirm(`Gérer le ${dateStr} :\n- OK pour bloquer la journée\n- Annuler pour définir des horaires spécifiques`);
      
      if (choice) {
        // Bloquer
        this.isSubmitting = true;
        this.homecare.blockDay(dateStr).subscribe({
          next: () => {
            this.successMessage = 'Journée bloquée.';
            this.isSubmitting = false;
            this.generateCalendar();
          }
        });
      } else {
        // Définir des heures spécifiques
        this.showForm = true;
        this.isExceptionMode = true;
        this.availabilityForm.patchValue({
          dayOfWeek: this.getDayOfWeekString(day.date.getDay()),
          specificDate: dateStr
        });
        // Scroll to form
        setTimeout(() => {
          document.querySelector('.settings-card')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }

  private getDayOfWeekString(dayNum: number): string {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[dayNum];
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  }

  getDayName(dayVal: string | undefined): string {
    if (!dayVal) return 'Unknown';
    return this.daysOfWeek.find(d => d.value === dayVal)?.label || dayVal;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  getNow(): Date {
    return new Date();
  }

  addAvailability(): void {
    if (this.availabilityForm.invalid) return;
    this.isSubmitting = true;
    const newSlot: AvailabilityDTO = { ...this.availabilityForm.value };
    newSlot.startTime = newSlot.startTime.length === 5 ? newSlot.startTime + ':00' : newSlot.startTime;
    newSlot.endTime = newSlot.endTime.length === 5 ? newSlot.endTime + ':00' : newSlot.endTime;

    this.homecare.saveAvailability(newSlot).subscribe({
      next: () => {
        this.successMessage = newSlot.specificDate ? `Horaires pour le ${newSlot.specificDate} enregistrés.` : 'Horaire hebdomadaire ajouté.';
        this.isSubmitting = false;
        this.showForm = false;
        this.isExceptionMode = false;
        this.availabilityForm.reset({
          dayOfWeek: 'MONDAY',
          startTime: '08:00',
          endTime: '17:00',
          available: true,
          specificDate: null
        });
        this.loadData();
      },
      error: (err) => { 
        this.isSubmitting = false;
        this.error = err.error?.message || "Erreur lors de l'enregistrement.";
      }
    });
  }

  deleteSlot(id: number): void {
    if (!confirm('Remove this weekly slot?')) return;
    this.homecare.deleteAvailability(id).subscribe({
      next: () => { this.loadData(); }
    });
  }
}
