import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { PatientService } from '../../../../../services/patient.service';
import { NotificationService, AppNotification } from '../../../../../services/notification.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit, OnDestroy {
  firstName: string = 'User';
  initials: string = 'U';
  photo: string | null = null;

  notifications: AppNotification[] = [];
  unreadCount: number = 0;
  showNotifications: boolean = false;

  private profileSub?: Subscription;
  private notifSub?: Subscription;

  constructor(
    private userService: UserService,
    public authService: AuthService,
    private patientService: PatientService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    const nameFromToken = this.authService.getUserFullName();
    if (nameFromToken) {
      this.setNames(nameFromToken);
    }

    this.profileSub = this.userService.profile$.subscribe(user => {
      if (user) {
        if (user.fullName) this.setNames(user.fullName);
        if (user.photo) this.photo = user.photo;
      }
    });

    this.userService.refreshProfile();

    this.patientService.getMe().subscribe({
      next: (patient) => {
        if (patient) {
          if (patient.fullName) this.setNames(patient.fullName);
          this.userService.setProfile({ photo: patient.photo ?? undefined });
          this.photo = patient.photo || null;
        }
      },
      error: () => {}
    });

    this.notifSub = this.notificationService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
      this.unreadCount = notifs.filter(n => !n.read).length;
    });
  }

  ngOnDestroy() {
    this.profileSub?.unsubscribe();
    this.notifSub?.unsubscribe();
  }

  private setNames(fullName: string) {
    if (!fullName) return;
    const parts = fullName.trim().split(/\s+/);
    this.firstName = parts[0];
    this.initials = parts.map(n => (n ? n[0] : '')).join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0]?.toUpperCase() || 'U';
  }

  toggleNotifications(event: MouseEvent) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
  }

  markAllAsRead(userId?: number) {
    this.notificationService.markAllRead();
  }

  navigateToRelated(notification: AppNotification) {
    this.notificationService.markRead(notification.id);
    this.showNotifications = false;
    if ((notification as any).orderId) {
      this.router.navigate(['/front/patient/pharmacy-orders', (notification as any).orderId]);
    }
  }

  getNotificationIcon(type: string): string {
    if (type.includes('VALIDATED') || type.includes('CONFIRMED')) return '✅';
    if (type.includes('DELIVERY')) return '🚚';
    if (type.includes('CANCELLED') || type.includes('REJECTED')) return '❌';
    return '🔔';
  }
}
