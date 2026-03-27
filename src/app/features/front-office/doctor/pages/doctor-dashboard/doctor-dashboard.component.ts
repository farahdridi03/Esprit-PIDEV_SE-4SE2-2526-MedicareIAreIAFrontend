import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';
import { AppointmentService } from '../../../../../services/appointment.service';
import { AppointmentDTO } from '../../../../../models/appointment.model';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit {
  currentView: 'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients' = 'calendar';
  firstName: string = '';
  todayAppointments: AppointmentDTO[] = [];
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
        this.todayAppointments = data || [];
        this.isLoadingAppointments = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingAppointments = false;
        this.cdr.detectChanges();
      }
    });
  }

  getPendingCount(): number {
    return this.todayAppointments.filter(a => a.status === 'BOOKED').length;
  }

  getLiveCount(): number {
    return this.todayAppointments.filter(a => a.status === 'LIVE').length;
  }

  setView(view: 'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients') {
    this.currentView = view;
    this.cdr.detectChanges();
  }
}
