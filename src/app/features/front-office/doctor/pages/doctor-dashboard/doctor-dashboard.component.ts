import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';
import { AppointmentService, Appointment } from '../../../../../services/appointment.service';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit {
  currentView: 'overview' | 'settings' | 'exceptions' | 'calendar' = 'calendar';
  firstName: string = '';
  todayAppointments: Appointment[] = [];
  isLoadingAppointments: boolean = true;

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.firstName = this.authService.getUserFullName() || 'Docteur';
    const doctorId = this.authService.getUserId();
    if (doctorId) {
      this.loadTodayAppointments(doctorId);
    }
  }

  loadTodayAppointments(doctorId: number): void {
    const today = new Date().toISOString().split('T')[0];
    this.isLoadingAppointments = true;
    this.appointmentService.getDoctorAppointments(doctorId, today).subscribe({
      next: (data) => {
        this.todayAppointments = data.sort((a, b) => a.startTime.localeCompare(b.startTime));
        this.isLoadingAppointments = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingAppointments = false;
        this.cdr.detectChanges();
      }
    });
  }

  setView(view: 'overview' | 'settings' | 'exceptions' | 'calendar') {
    this.currentView = view;
    this.cdr.detectChanges();
  }
}
