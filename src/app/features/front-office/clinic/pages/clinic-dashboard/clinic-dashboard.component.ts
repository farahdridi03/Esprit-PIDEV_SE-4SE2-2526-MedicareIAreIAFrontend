import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { EmergencyService, EmergencyAlertResponse } from '../../../../../services/emergency.service';
import { AmbulanceService, AmbulanceResponse } from '../../../../../services/ambulance.service';

@Component({
  selector: 'app-clinic-dashboard',
  templateUrl: './clinic-dashboard.component.html',
  styleUrls: ['./clinic-dashboard.component.scss']
})
export class ClinicDashboardComponent implements OnInit {
  firstName: string = 'Clinic';
  initials: string = 'C';

  alerts: EmergencyAlertResponse[] = [];
  ambulances: AmbulanceResponse[] = [];
  loadingAlerts = true;
  loadingAmbulances = true;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private emergencyService: EmergencyService,
    private ambulanceService: AmbulanceService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.userService.getProfile().subscribe({
      next: (user) => { if (user?.fullName) this.setNames(user.fullName); },
      error: (err) => console.error('Error fetching clinic profile', err)
    });

    // Load recent emergency alerts
    this.emergencyService.getAllAlerts().subscribe({
      next: (data) => {
        this.alerts = data
          .filter(a => a.status === 'PENDING' || a.status === 'ACKNOWLEDGED')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        this.loadingAlerts = false;
      },
      error: () => { this.loadingAlerts = false; }
    });

    // Load ambulances
    const clinicId = this.authService.getUserId();
    if (clinicId) {
      this.ambulanceService.getByClinic(clinicId).subscribe({
        next: (data) => { this.ambulances = data; this.loadingAmbulances = false; },
        error: () => { this.loadingAmbulances = false; }
      });
    } else {
      this.loadingAmbulances = false;
    }
  }

  private loadUserInfo() {
    const fullName = this.authService.getUserFullName();
    if (fullName) this.setNames(fullName);
  }

  private setNames(fullName: string) {
    if (!fullName) return;
    const parts = fullName.split(' ');
    this.firstName = parts[0];
    this.initials = parts.map(n => n ? n[0] : '').join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0].toUpperCase();
  }

  get ambulancesWithGpsCount(): number {
    return this.ambulances.filter(a => a.currentLat && a.currentLng).length;
  }

  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return '🚨';
      case 'HIGH': return '⚠️';
      case 'MEDIUM': return '🔔';
      default: return '💡';
    }
  }

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'high';
      case 'HIGH': return 'high';
      default: return 'info';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
}
