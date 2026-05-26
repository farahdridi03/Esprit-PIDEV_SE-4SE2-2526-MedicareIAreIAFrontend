import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService, UserProfile } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { PatientService } from '../../../../../services/patient.service';
import { NotificationService } from '../../../../../services/notification.service';
import { NotificationResponseDTO } from '../../../../../models/notification.model';
import { DeliveryTrackingService } from '../../../../../services/delivery-tracking.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit, OnDestroy {
  firstName: string = 'User';
  initials: string = 'U';
  photo: string | null = null;
  currentUserId: number | null = null;

  // Notifications
  notifications: any[] = [];
  unreadCount = 0;
  showDropdown = false;
  showNotifications = false;
  
  private pollInterval: any;
  private profileSub?: Subscription;
  private notifSub?: Subscription;

  constructor(
    private userService: UserService,
    public authService: AuthService,
    private patientService: PatientService,
    private notificationService: NotificationService,
    private deliveryTrackingService: DeliveryTrackingService,
    public router: Router,
    private elRef: ElementRef
  ) {}

  ngOnInit() {
    // 1. Name and ID from token (immediate)
    const nameFromToken = this.authService.getUserFullName();
    if (nameFromToken) {
      this.setNames(nameFromToken);
    }
    this.currentUserId = this.authService.getUserId();

    // 2. React to profile$ stream updates
    this.profileSub = this.userService.profile$.subscribe(user => {
      if (user) {
        if (user.fullName) this.setNames(user.fullName);
        if ((user as any).photo) this.photo = (user as any).photo;
        if ((user as any).profileImage) this.photo = (user as any).profileImage;
      }
    });

    // 3. Fetch Patient Profile specifically for the photo
    this.patientService.getMe().subscribe({
      next: (patient) => {
        if (patient) {
          if (patient.fullName) this.setNames(patient.fullName);
          this.userService.setProfile({ photo: patient.photo ?? undefined } as any);
          this.photo = patient.photo || null;
        }
      },
      error: () => {}
    });

    // 4. Notifications Setup
    if (this.currentUserId) {
      const email = this.authService.getUserEmail();
      
      // Initial load via service
      this.notificationService.getNotifications(this.currentUserId).subscribe();

      // Subscription to reactive streams
      this.notifSub = this.notificationService.notifications$.subscribe(notifs => {
        this.notifications = notifs;
      });
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      });

      // WebSocket for real-time
      if (email) {
        this.deliveryTrackingService.connectToUserNotifications(email);
      }

      // Polling as fallback/legacy support if needed
      this.startPolling();
    }
  }

  ngOnDestroy(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.profileSub) this.profileSub.unsubscribe();
    if (this.notifSub) this.notifSub.unsubscribe();
    this.deliveryTrackingService.disconnect();
  }

  private setNames(fullName: string) {
    if (!fullName) return;
    const parts = fullName.trim().split(/\s+/);
    this.firstName = parts[0];
    this.initials = parts.map(n => (n ? n[0] : '')).join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0]?.toUpperCase() || 'U';
  }

  // ==== NOTIFICATIONS ====
  private startPolling(): void {
    if (this.currentUserId) {
      this.refreshNotifs();
      this.pollInterval = setInterval(() => this.refreshNotifs(), 30000); // Polling less frequently if WebSocket is active
    }
  }

  private refreshNotifs(): void {
    if (!this.currentUserId) return;
    // Trigger the reactive stream update in NotificationService
    this.notificationService.getNotifications(this.currentUserId).subscribe();
  }


  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  toggleNotifications(event: MouseEvent) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(notification: any) {
    if (notification.isRead || notification.read) return;
    this.notificationService.markAsRead(notification.id, this.currentUserId || undefined).subscribe({
      next: () => {
        notification.isRead = true;
        notification.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    });
  }


  markAllAsRead() {
    if (this.currentUserId) {
      this.notificationService.markAllAsRead(this.currentUserId).subscribe({
        next: () => {
          this.notifications.forEach(n => {
            n.isRead = true;
            n.read = true;
          });
          this.unreadCount = 0;
        }
      });
    }
  }

  navigateToRelated(notification: any) {
    this.markAsRead(notification);
    this.showNotifications = false;
    this.showDropdown = false;

    if (notification.orderId) {
      if (notification.type?.includes('ORDER') || notification.type?.includes('DELIVERY') || notification.type?.includes('PAYMENT')) {
        this.router.navigate(['/front/patient/pharmacy-orders', notification.orderId]);
      }
    }
  }

  getNotificationIcon(type: string): string {
    if (!type) return '🔔';
    if (type.includes('VALIDATED') || type.includes('CONFIRMED')) return '✅';
    if (type.includes('DELIVERY')) return '🚚';
    if (type.includes('CANCELLED') || type.includes('REJECTED')) return '❌';
    return '🔔';
  }

  timeAgo(date: Date | string): string {
    const d = new Date(date);
    const diffMs = Date.now() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'À l\'instant';
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Il y a ${diffH}h`;
    return `Il y a ${Math.floor(diffH / 24)}j`;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
      this.showNotifications = false;
    }
  }

  logout() {
    this.authService.logout();
  }
}
