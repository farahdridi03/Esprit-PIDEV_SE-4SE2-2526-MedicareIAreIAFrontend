import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ScheduleService } from '../../../../../services/schedule.service';
import { AuthService } from '../../../../../services/auth.service';
import { ScheduleException, ExceptionType, TimeSlot } from '../../../../../models/schedule.model';

@Component({
  selector: 'app-doctor-calendar-exceptions',
  templateUrl: './doctor-calendar-exceptions.component.html',
  styleUrls: ['./doctor-calendar-exceptions.component.scss']
})
export class DoctorCalendarExceptionsComponent implements OnInit {
  exceptionForm!: FormGroup;
  exceptions: ScheduleException[] = [];
  providerId!: number;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  showForm = false;

  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.providerId = this.authService.getUserId() || 1;
    this.initForm();
    this.loadExceptions();
  }

  initForm(): void {
    this.exceptionForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      type: ['ABSENCE', Validators.required],
      reason: ['', Validators.required],
      isAvailable: [false] // default to blocked
    });
  }

  loadExceptions(): void {
    this.isLoading = true;
    this.scheduleService.getExceptions(this.providerId).subscribe({
      next: (data) => {
        this.exceptions = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des exceptions.';
        this.isLoading = false;
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.exceptionForm.reset({ type: 'ABSENCE', isAvailable: false });
    }
  }

  addException(): void {
    if (this.exceptionForm.invalid) {
      this.exceptionForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const newException: ScheduleException = {
      ...this.exceptionForm.value,
      providerId: this.providerId
    };

    this.scheduleService.addException(this.providerId, newException).subscribe({
      next: (res) => {
        this.exceptions.unshift(res);
        this.successMessage = 'Exception ajoutée avec succès.';
        this.isSaving = false;
        this.toggleForm();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l\'ajout.';
        this.isSaving = false;
      }
    });
  }

  deleteException(id: number | undefined): void {
    if (!id) return;
    if (confirm('Voulez-vous vraiment supprimer cette exception ?')) {
      this.scheduleService.deleteException(this.providerId, id).subscribe(() => {
        this.exceptions = this.exceptions.filter(e => e.id !== id);
      });
    }
  }

  getExceptionTypeLabel(type: ExceptionType): string {
    const labels: Record<ExceptionType, string> = {
      TIME_OFF: 'Congé',
      ABSENCE: 'Absence',
      HOLIDAY: 'Jour Férié',
      PARTIAL_AVAILABILITY: 'Disponibilité Partielle'
    };
    return labels[type] || type;
  }
}
