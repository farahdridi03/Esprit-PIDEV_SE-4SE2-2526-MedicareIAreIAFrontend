import { Component, OnInit } from '@angular/core';
import { AppointmentService, Appointment } from '../../../../../services/appointment.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-patient-appointments',
  templateUrl: './patient-appointments.component.html',
  styleUrls: ['./patient-appointments.component.scss']
})
export class PatientAppointmentsComponent implements OnInit {
  activeTab: 'upcoming' | 'past' | 'cancelled' = 'upcoming';
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  isLoading: boolean = true;
  error: string = '';

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const patientId = this.authService.getUserId();
    if (patientId) {
      this.loadAppointments(patientId);
    } else {
      this.error = 'User not authenticated';
      this.isLoading = false;
    }
  }

  loadAppointments(patientId: number): void {
    this.isLoading = true;
    this.appointmentService.getPatientAppointments(patientId).subscribe({
      next: (data) => {
        this.appointments = data;
        this.filterByTab();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load appointments';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  setTab(tab: 'upcoming' | 'past' | 'cancelled'): void {
    this.activeTab = tab;
    this.filterByTab();
  }

  filterByTab(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    
    switch (this.activeTab) {
      case 'upcoming':
        this.filteredAppointments = this.appointments.filter(a => 
          (a.status === 'BOOKED' || a.status === 'RESCHEDULED') && a.date >= todayStr
        );
        break;
      case 'past':
        this.filteredAppointments = this.appointments.filter(a => 
          (a.status === 'COMPLETED' || a.date < todayStr) && a.status !== 'CANCELLED'
        );
        break;
      case 'cancelled':
        this.filteredAppointments = this.appointments.filter(a => a.status === 'CANCELLED');
        break;
    }
  }

  cancelAppointment(id: number): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(id).subscribe({
        next: () => {
          alert('Appointment cancelled successfully');
          const patientId = this.authService.getUserId();
          if (patientId) this.loadAppointments(patientId);
        },
        error: () => alert('Failed to cancel appointment')
      });
    }
  }
}
