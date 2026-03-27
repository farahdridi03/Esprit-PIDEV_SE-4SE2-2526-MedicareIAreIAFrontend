import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';
import { AppointmentService } from '../../../../../services/appointment.service';
import { AppointmentDTO } from '../../../../../models/appointment.model';

@Component({
  selector: 'app-doctor-patients',
  templateUrl: './doctor-patients.component.html',
  styleUrls: ['./doctor-patients.component.scss']
})
export class DoctorPatientsComponent implements OnInit {
  todayAppointments: AppointmentDTO[] = [];
  isLoadingAppointments: boolean = true;
  firstName: string = '';

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
        this.todayAppointments = data.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
        this.isLoadingAppointments = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingAppointments = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmAppointment(id: number): void {
    this.appointmentService.confirmAppointment(id).subscribe({
      next: () => {
        const doctorId = this.authService.getUserId();
        if (doctorId) this.loadTodayAppointments(doctorId);
      },
      error: (err) => console.error('Confirm error:', err)
    });
  }

  startConsultation(app: AppointmentDTO): void {
    this.appointmentService.startTeleconsultation(app.id).subscribe({
      next: (res) => {
        if (res.meetingLink) window.open(res.meetingLink, '_blank');
        const doctorId = this.authService.getUserId();
        if (doctorId) this.loadTodayAppointments(doctorId);
      },
      error: (err) => console.error('Start room error:', err)
    });
  }

  openMeeting(link: string | undefined): void {
    if (link) {
      const authName = this.authService.getUserFullName() || this.firstName;
      const fullLink = `${link}#userInfo.displayName="Dr. ${authName}"`;
      window.open(fullLink, '_blank');
    }
  }
}
