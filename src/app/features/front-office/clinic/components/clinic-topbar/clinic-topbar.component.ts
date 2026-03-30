import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { EmergencyService, EmergencyAlertResponse } from '../../../../../services/emergency.service';
import { AmbulanceService } from '../../../../../services/ambulance.service';

@Component({
  selector: 'app-clinic-topbar',
  templateUrl: './clinic-topbar.component.html',
  styleUrls: ['./clinic-topbar.component.scss']
})
export class ClinicTopbarComponent implements OnInit, OnDestroy {
  firstName: string = 'Clinic';
  initials: string = 'C';
  photo: string | null = null;

  notifications: EmergencyAlertResponse[] = [];
  unreadCount: number = 0;
  showNotifications: boolean = false;
  dispatchingAlertId: number | null = null;
  dispatchMessage: string = '';
  dispatchSuccess: boolean = true;
  private intervalId: any;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private emergencyService: EmergencyService,
    private ambulanceService: AmbulanceService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.userService.getProfile().subscribe({
      next: (user) => {
        if (user && user.fullName) {
          this.setNames(user.fullName);
        }
        this.photo = (user as any).photo || (user as any).profileImage || null;
      },
      error: (err) => console.error('Error fetching clinic profile', err)
    });

    this.checkAlerts();
    this.intervalId = setInterval(() => this.checkAlerts(), 10000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.unreadCount = 0;
      this.dispatchMessage = '';
    }
  }

  private checkAlerts() {
    this.emergencyService.getAlertsByStatus('PENDING').subscribe({
      next: (alerts) => {
        const active = alerts
          .filter(a => !a.canceledByPatient)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (active.length > this.notifications.length && !this.showNotifications) {
          this.unreadCount += active.length - this.notifications.length;
        }
        this.notifications = active;
      },
      error: (err) => console.error('Error fetching alerts', err)
    });
  }

  dispatchAmbulance(alertData: EmergencyAlertResponse, event: Event) {
    event.stopPropagation();
    event.preventDefault();

    this.dispatchingAlertId = alertData.id;
    this.dispatchMessage = '';

    this.ambulanceService.getAll().subscribe({
      next: (ambulances) => {
        const available = ambulances.filter(
          a => a.status !== 'ON_DUTY' && a.status !== 'EN_TRAVAIL'
        );

        if (available.length === 0) {
          this.dispatchMessage = '⚠️ No ambulance available.';
          this.dispatchSuccess = false;
          this.dispatchingAlertId = null;
          return;
        }

        const ambulance = available[0];

        this.ambulanceService.update(ambulance.id, {
          ...ambulance,
          currentLat: alertData.latitude,
          currentLng: alertData.longitude,
          status: 'ON_DUTY'
        }).subscribe({
          next: () => {
            this.emergencyService.updateAlertStatus(alertData.id, 'RESOLVED').subscribe({
              next: () => {
                this.notifications = this.notifications.filter(a => a.id !== alertData.id);
                this.dispatchMessage = `✅ Ambulance dispatched successfully.`;
                this.dispatchSuccess = true;
                this.dispatchingAlertId = null;
                setTimeout(() => { this.dispatchMessage = ''; }, 4000);
              },
              error: () => {
                this.dispatchMessage = '⚠️ Error resolving alert.';
                this.dispatchSuccess = false;
                this.dispatchingAlertId = null;
              }
            });
          },
          error: () => {
            this.dispatchMessage = '❌ Failed to dispatch ambulance.';
            this.dispatchSuccess = false;
            this.dispatchingAlertId = null;
          }
        });
      }
    });
  }

  private loadUserInfo() {
    // Immediate load from Auth Service
    const fullName = this.authService.getUserFullName();
    if (fullName) this.setNames(fullName);

    // Reactive subscription
    this.userService.profile$.subscribe(user => {
      if (user) {
        if (user.fullName) this.setNames(user.fullName);
        this.photo = (user as any).photo || (user as any).profileImage || null;
      }
    });
  }

  private setNames(fullName: string) {
    if (!fullName) return;
    const parts = fullName.trim().split(/\s+/);
    this.firstName = parts[0];
    this.initials = parts.map(n => n ? n[0] : '').join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0].toUpperCase();
  }
}
