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
  currentView: 'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients' = 'overview';
  firstName: string = '';
  todayAppointments: AppointmentDTO[] = [];
  allAppointments: AppointmentDTO[] = [];
  isLoadingAppointments: boolean = true;
  totalPatientsCount: number = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    const fullName = this.authService.getUserFullName() || 'Docteur';
    // Clean name handling
    this.firstName = (fullName.toLowerCase().startsWith('dr') || fullName.toLowerCase().startsWith('dr.')) 
                     ? fullName.split(' ').slice(1).join(' ') 
                     : fullName;
    
    const doctorId = this.authService.getUserId();
    if (doctorId) {
      this.loadDashboardData(doctorId);
    }
  }

  loadDashboardData(doctorId: number): void {
    const today = new Date().toISOString().split('T')[0];
    this.isLoadingAppointments = true;
    
    // Fetch today's appts
    this.appointmentService.getDoctorAppointments(doctorId, today).subscribe({
      next: (data) => {
        this.todayAppointments = data || [];
        this.isLoadingAppointments = false;
        this.cdr.detectChanges();
      },
      error: () => this.isLoadingAppointments = false
    });

    // Fetch all appts for stats (total patients, etc)
    this.appointmentService.getDoctorAppointments(doctorId).subscribe({
      next: (data) => {
        this.allAppointments = data || [];
        // Unique patients count
        const patientIds = new Set(this.allAppointments.map(a => a.patientId));
        this.totalPatientsCount = patientIds.size;
        this.cdr.detectChanges();
      }
    });
  }

  getPendingCount(): number {
    return this.todayAppointments.filter(a => a.status === 'BOOKED' || a.status === 'PENDING').length;
  }

  getLiveCount(): number {
    return this.todayAppointments.filter(a => a.status === 'LIVE').length;
  }

  getPendingReviews(): number {
     // Mock for now, linked to past completed appointments
     return this.allAppointments.filter(a => a.status === 'COMPLETED').length % 7;
  }

  setView(view: 'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients') {
    this.currentView = view;
    this.cdr.detectChanges();
  }
}
