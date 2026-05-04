import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { EmergencyService, EmergencyAlertResponse } from '../../../../../services/emergency.service';
import { AmbulanceService } from '../../../../../services/ambulance.service';
import { WebSocketNotificationService, WsNotification } from '../../../../../services/websocket-notification.service';

@Component({
  selector: 'app-clinic-topbar',
  templateUrl: './clinic-topbar.component.html',
  styleUrls: ['./clinic-topbar.component.scss']
})
export class ClinicTopbarComponent implements OnInit, OnDestroy {
  firstName: string = 'Clinic';
  initials: string = 'C';

  notifications: EmergencyAlertResponse[] = [];
  unreadCount: number = 0;
  showNotifications: boolean = false;
  dispatchingAlertId: number | null = null;
  dispatchMessage: string = '';
  dispatchSuccess: boolean = true;

  private intervalId: any;
  private wsSub: Subscription | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private emergencyService: EmergencyService,
    private ambulanceService: AmbulanceService,
    private wsNotif: WebSocketNotificationService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.userService.getProfile().subscribe({
      next: (user) => {
        if (user && user.fullName) this.setNames(user.fullName);
      },
      error: (err) => console.error('Error fetching clinic profile', err)
    });

    // Polling pour maintenir la liste à jour
    this.checkAlerts();
    this.intervalId = setInterval(() => this.checkAlerts(), 10000);

    // WebSocket : notification immédiate quand un patient envoie une alerte
    this.wsNotif.connect();
    this.wsNotif.subscribeAsClinic();
    this.wsSub = this.wsNotif.clinicNotifications$.subscribe((notifs: WsNotification[]) => {
      if (notifs.length > 0) {
        // Recharger la liste d'alertes immédiatement
        this.checkAlerts();
        // Incrémenter le badge si le panel est fermé
        if (!this.showNotifications) {
          this.unreadCount++;
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.wsSub?.unsubscribe();
    this.wsNotif.unsubscribeClinic();
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
          this.dispatchMessage = '⚠️ No ambulance available. All are currently on duty.';
          this.dispatchSuccess = false;
          this.dispatchingAlertId = null;
          return;
        }

        const ambulance = available[0];

        this.ambulanceService.update(ambulance.id, {
          clinicId: ambulance.clinicId,
          currentLat: alertData.latitude,
          currentLng: alertData.longitude,
          licensePlate: ambulance.licensePlate,
          status: 'ON_DUTY'
        }).subscribe({
          next: () => {
            this.emergencyService.updateAlertStatus(alertData.id, 'RESOLVED').subscribe({
              next: () => {
                this.notifications = this.notifications.filter(a => a.id !== alertData.id);
                const plate = ambulance.licensePlate || `#${ambulance.id}`;
                this.dispatchMessage = `✅ Ambulance ${plate} dispatched successfully. Alert resolved.`;
                this.dispatchSuccess = true;
                this.dispatchingAlertId = null;
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
}
