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
<<<<<<< HEAD
        if (user && user.fullName) this.setNames(user.fullName);
=======
        if (user && user.fullName) {
          this.setNames(user.fullName);
        }
        this.photo = (user as any).photo || null;
>>>>>>> origin/frontVersion1
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

    // Step 1: Find an available ambulance
    this.ambulanceService.getAll().subscribe({
      next: (ambulances) => {
        const available = ambulances.filter(
          a => a.status !== 'ON_DUTY' && a.status !== 'EN_TRAVAIL'
        );

        if (available.length === 0) {
          this.dispatchMessage = '⚠️ No ambulance available. All are currently on duty.';
          this.dispatchSuccess = false;
          this.dispatchingAlertId = null;
          return;
        }

        const ambulance = available[0];

        // Step 2: Mark ambulance as ON_DUTY and set destination coordinates
        this.ambulanceService.update(ambulance.id, {
          clinicId: ambulance.clinicId,
          currentLat: alertData.latitude,
          currentLng: alertData.longitude,
          licensePlate: ambulance.licensePlate,
          status: 'ON_DUTY'
        }).subscribe({
          next: () => {
            // Step 3: Resolve the alert
            this.emergencyService.updateAlertStatus(alertData.id, 'RESOLVED').subscribe({
              next: () => {
                this.notifications = this.notifications.filter(a => a.id !== alertData.id);
                const plate = ambulance.licensePlate || `#${ambulance.id}`;
                this.dispatchMessage = `✅ Ambulance ${plate} dispatched successfully. Alert resolved.`;
                this.dispatchSuccess = true;
                this.dispatchingAlertId = null;
                // Auto-hide message after 4 seconds
                setTimeout(() => { this.dispatchMessage = ''; }, 4000);
              },
              error: () => {
                this.dispatchMessage = '⚠️ Ambulance dispatched but failed to resolve alert.';
                this.dispatchSuccess = false;
                this.dispatchingAlertId = null;
              }
            });
          },
          error: () => {
            this.dispatchMessage = '❌ Failed to dispatch ambulance. Please try again.';
            this.dispatchSuccess = false;
            this.dispatchingAlertId = null;
          }
        });
      },
      error: () => {
        this.dispatchMessage = '❌ Could not load ambulances.';
        this.dispatchSuccess = false;
        this.dispatchingAlertId = null;
      }
    });
  }

  private loadUserInfo() {
<<<<<<< HEAD
    const fullName = this.authService.getUserFullName();
    if (fullName) this.setNames(fullName);
=======
    this.userService.profile$.subscribe(user => {
      if (user) {
        if (user.fullName) {
          this.setNames(user.fullName);
        }
        this.photo = (user as any).photo || null;
      }
    });
    // Trigger initial load if not already loaded
    this.userService.refreshProfile();
>>>>>>> origin/frontVersion1
  }

  private setNames(fullName: string) {
    if (!fullName) return;
    const parts = fullName.split(' ');
    this.firstName = parts[0];
    this.initials = parts.map(n => n ? n[0] : '').join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0].toUpperCase();
  }
}
