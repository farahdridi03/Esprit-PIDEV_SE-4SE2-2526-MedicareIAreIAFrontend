import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { NotificationService } from '../../../../../services/notification.service';
import { DeliveryTrackingService } from '../../../../../services/delivery-tracking.service';
import { NotificationResponseDTO } from '../../../../../models/notification.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-home-care-topbar',
    templateUrl: './home-care-topbar.component.html',
    styleUrls: ['./home-care-topbar.component.scss']
})
export class HomeCareTopbarComponent implements OnInit, OnDestroy {
  firstName: string = 'Provider';
  initials: string = 'H';
  photo: string | null = null;

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
      next: (user) => {
        if (user && user.fullName) {
          this.setNames(user.fullName);
        }
        this.photo = (user as any).photo || null;
      },
      error: (err) => {
        console.error('Error fetching home care profile', err);
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
      case 'NEW_HOMECARE_REQUEST': return '🏠';
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
  }

  private setNames(fullName: string) {
    if (!fullName) return;
    const parts = fullName.split(' ');
    this.firstName = parts[0];
    this.initials = parts.map(n => n ? n[0] : '').join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0].toUpperCase();
  }
}
