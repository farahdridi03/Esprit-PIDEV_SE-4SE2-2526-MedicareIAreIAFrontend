import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserProfile } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { NotificationService } from '../../../../../services/notification.service';

@Component({
  selector: 'app-pharmacist-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pharmacist-topbar.component.html',
  styleUrls: ['./pharmacist-topbar.component.scss']
})
export class PharmacistTopbarComponent implements OnInit {
  firstName: string = 'Pharmacist';
  initials: string = 'P';
  photo: string | null = null;

  // Notifications
  notifications: any[] = [];
  unreadCount = 0;
  showNotifPanel = false;

  constructor(
    private userService: UserService, 
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.setupNotifications();
    this.userService.getProfile().subscribe({
      next: (user: UserProfile) => {
        if (user && user.fullName) {
          this.setNames(user.fullName);
        }
        this.photo = (user as any).photo || (user as any).profileImage || null;
      },
      error: (err: any) => {
        console.error('Error fetching pharmacist profile', err);
      }
    });
  }

  private loadUserInfo() {
    this.userService.profile$.subscribe(user => {
      if (user) {
        if (user.fullName) {
          this.setNames(user.fullName);
        }
        this.photo = (user as any).photo || (user as any).profileImage || null;
      }
    });
    // Trigger initial load if not already loaded
    this.userService.refreshProfile();
    
    const fullName = this.authService.getUserFullName();
    if (fullName) this.setNames(fullName);
  }

  private setupNotifications() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.notificationService.getNotifications(userId).subscribe();
      this.notificationService.notifications$.subscribe(notifs => {
        this.notifications = notifs;
      });
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      });
    }
  }

  toggleNotifPanel(event: MouseEvent) {
    event.stopPropagation();
    this.showNotifPanel = !this.showNotifPanel;
  }

  markAllAsRead() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.notificationService.markAllAsRead(userId).subscribe();
    }
  }

  markAsRead(notification: any) {
    if (notification.isRead || notification.read) return;
    this.notificationService.markAsRead(notification.id).subscribe();
  }

  getNotificationIcon(type: string): string {
    if (!type) return '🔔';
    if (type.includes('VALIDATED') || type.includes('CONFIRMED')) return '✅';
    if (type.includes('DELIVERY')) return '🚚';
    if (type.includes('CANCELLED') || type.includes('REJECTED')) return '❌';
    return '🔔';
  }

  private setNames(fullName: string) {
    if (!fullName) return;
    const parts = fullName.split(' ');
    this.firstName = parts[0];
    this.initials = parts.map(n => n ? n[0] : '').join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0].toUpperCase();
  }
}
