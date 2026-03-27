import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { AppointmentService } from '../../../../../services/appointment.service';
import { AppointmentDTO } from '../../../../../models/appointment.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  firstName: string = 'User';
  nextAppointment: AppointmentDTO | null = null;
  appointmentCount: number = 0;

  constructor(
    private userService: UserService, 
    private authService: AuthService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit() {
    // Initial load from token
    const fullName = this.authService.getUserFullName();
    if (fullName) {
      this.firstName = fullName.split(' ')[0];
    }

    // Refresh from profile API
    this.userService.getProfile().subscribe({
      next: (user) => {
        if (user && user.fullName) {
          this.firstName = user.fullName.split(' ')[0];
        }
      },
      error: (err) => console.error('Error fetching user profile', err)
    });

    this.loadNextAppointment();
  }

  loadNextAppointment() {
    const patientId = this.authService.getUserId();
    if (!patientId) return;

    this.appointmentService.getPatientAppointments(patientId).subscribe({
      next: (data) => {
        this.appointmentCount = data.filter(a => a.status === 'BOOKED' || a.status === 'CONFIRMED').length;
        
        const now = new Date();
        const todayStr = now.getFullYear() + '-' + 
                         String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(now.getDate()).padStart(2, '0');

        const upcoming = data
          .filter(a => a.date >= todayStr && (a.status === 'BOOKED' || a.status === 'CONFIRMED'))
          .sort((a,b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

        if (upcoming.length > 0) {
          this.nextAppointment = upcoming[0];
        }
      },
      error: (err) => console.error('Error loading next appt', err)
    });
  }
}
