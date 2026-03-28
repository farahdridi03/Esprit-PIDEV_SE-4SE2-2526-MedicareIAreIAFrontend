import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { UserService, UserProfile } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { NotificationService } from '../../../../../services/notification.service';
import { DeliveryTrackingService } from '../../../../../services/delivery-tracking.service';
import { NotificationResponseDTO } from '../../../../../models/notification.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pharmacist-topbar',
  templateUrl: './pharmacist-topbar.component.html',
  styleUrls: ['./pharmacist-topbar.component.scss']
})
export class PharmacistTopbarComponent implements OnInit, OnDestroy {
  firstName: string = 'Pharmacist';
  initials: string = 'P';

  // Notification state
  notifications: NotificationResponseDTO[] = [];
  unreadCount: number = 0;
  showNotifPanel: boolean = false;

  private notifSub?: Subscription;
  private unreadSub?: Subscription;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private deliveryTrackingService: DeliveryTrackingService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.userService.getProfile().subscribe({
      next: (user: UserProfile) => {
        if (user && user.fullName) {
          this.setNames(user.fullName);
        }
      },
      error: (err: any) => {
        console.error('Error fetching pharmacist profile', err);
      }
    });

    // Subscribe to real-time notifications stream
    this.notifSub = this.notificationService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
    });
    this.unreadSub = this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });

    // Load past notifications + connect WebSocket
    const userId = this.authService.getUserId();
    const email = this.authService.getUserEmail();
    if (userId) {
      this.notificationService.getNotifications(userId).subscribe();
    }
    if (email) {
      this.deliveryTrackingService.connectToUserNotifications(email);
    }
  }

  ngOnDestroy() {
    this.notifSub?.unsubscribe();
    this.unreadSub?.unsubscribe();
    this.deliveryTrackingService.disconnect();
  }

  toggleNotifPanel(event?: Event) {
    if (event) event.stopPropagation();
    this.showNotifPanel = !this.showNotifPanel;
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'ORDER_STATUS_UPDATE': return '📦';
      case 'NEW_MESSAGE': return '💬';
      case 'PAYMENT_RECEIVED': return '💰';
      default: return '🔔';
    }
  }

  markAsRead(notif: NotificationResponseDTO) {
    if (!notif.isRead) {
      this.notificationService.markAsRead(notif.id).subscribe();
    }
  }

  markAllAsRead() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.notificationService.markAllAsRead(userId).subscribe();
    }
  }

  // Close the panel when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-container') && !target.closest('.notification-dropdown')) {
      this.showNotifPanel = false;
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
}
