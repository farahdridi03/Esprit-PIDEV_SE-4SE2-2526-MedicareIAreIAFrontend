import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { NotificationService } from '../../../../services/notification.service';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';
import { NotificationResponseDTO } from '../../../../models/notification.model';
import { DeliveryTrackingService } from '../../../../services/delivery-tracking.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-topbar',
  templateUrl: './admin-topbar.component.html',
  styleUrls: ['./admin-topbar.component.scss']
})
export class AdminTopbarComponent implements OnInit, OnDestroy {
  // User Info
  firstName: string = 'Admin';
  initials: string = 'AD';
  photo: string | null = null;

  // Notifications
  notifications: NotificationResponseDTO[] = [];
  unreadCount = 0;
  showNotifications = false;
  showDropdown = false;
  
  private notifSub!: Subscription;
  private profileSub?: Subscription;

  constructor(
    private notificationService: NotificationService,
    private elRef: ElementRef,
    private userService: UserService,
    public authService: AuthService,
    private deliveryTrackingService: DeliveryTrackingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. User Profile Setup
    this.loadUserInfo();
    this.userService.getProfile().subscribe({
      next: (user) => {
        if (user) {
          if (user.fullName) this.setNames(user.fullName);
          this.photo = (user as any).photo || user.profileImage || null;
        }
      }
    });

    // 2. Notifications Setup
    const userId = this.authService.getUserId();
    const email = this.authService.getUserEmail();

    if (userId) {
        // Initial load
        this.notificationService.getNotifications(userId).subscribe();
        
        // Subscribe to reactive streams
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
    }
  }

  ngOnDestroy(): void {
    if (this.notifSub) this.notifSub.unsubscribe();
    if (this.profileSub) this.profileSub.unsubscribe();
    this.deliveryTrackingService.disconnect();
  }

  // --- User Name Helpers ---
  private loadUserInfo() {
    const fullName = this.authService.getUserFullName();
    if (fullName) {
      this.setNames(fullName);
    }
    this.profileSub = this.userService.profile$.subscribe(user => {
      if (user) {
        if (user.fullName) this.setNames(user.fullName);
        this.photo = (user as any).photo || user.profileImage || null;
      }
    });
  }

  private setNames(fullName: string) {
    if (!fullName) return;
    const parts = fullName.trim().split(/\s+/);
    this.firstName = parts[0];
    this.initials = parts.map(n => n ? n[0] : '').join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0]?.toUpperCase() || 'A';
  }

  // --- Notification Helpers ---
  toggleNotifications(event: MouseEvent): void {
      event.stopPropagation();
      this.showNotifications = !this.showNotifications;
      if (this.showNotifications) this.showDropdown = false;
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) this.showNotifications = false;
  }

  markAsRead(notification: NotificationResponseDTO): void {
      if (notification.isRead || (notification as any).read) return;
      this.notificationService.markAsRead(notification.id).subscribe({
          next: () => {
              notification.isRead = true;
              this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
      });
  }

  markAllAsRead(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.notificationService.markAllAsRead(userId).subscribe();
    }
  }

  clearAll(): void {
    this.notificationService.clearAll();
  }

  navigateToRelated(notification: NotificationResponseDTO): void {
      this.markAsRead(notification);
      this.showNotifications = false;
      
      if (notification.type === 'REG_REQ') {
          this.router.navigate(['/admin/validations']);
      }
  }

  getNotificationIcon(type: string): string {
      if (type === 'REG_REQ') return '👨‍⚕️';
      if (type === 'aid_request') return '🤝';
      if (type === 'warning') return '⚠️';
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
      this.showNotifications = false;
      this.showDropdown = false;
    }
  }

  logout(): void {
      this.authService.logout();
      this.router.navigate(['/auth/login']);
  }
}
