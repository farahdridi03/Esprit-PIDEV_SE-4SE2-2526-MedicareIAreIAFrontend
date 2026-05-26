import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserProfile } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-home-care-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-care-topbar.component.html',
  styleUrls: ['./home-care-topbar.component.scss']
})
export class HomeCareTopbarComponent implements OnInit {
  firstName: string = 'Provider';
  initials: string = 'P';
  photo: string | null = null;
  
  notifications: any[] = [];
  unreadCount: number = 0;
  showNotifPanel = false;

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    this.loadUserInfo();
    this.userService.getProfile().subscribe({
      next: (user: UserProfile) => {
        if (user && user.fullName) {
          this.setNames(user.fullName);
        }
        this.photo = (user as any).photo || (user as any).profileImage || null;
      },
      error: (err: any) => {
        console.error('Error fetching home care profile', err);
      }
    });
  }

  toggleNotifPanel(event: Event) {
    event.stopPropagation();
    this.showNotifPanel = !this.showNotifPanel;
    if (this.showNotifPanel) {
      this.unreadCount = 0;
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.isRead = true);
    this.unreadCount = 0;
  }

  markAsRead(notification: any) {
    notification.isRead = true;
    this.unreadCount = Math.max(0, this.unreadCount - 1);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'APPOINTMENT': return '📅';
      case 'MESSAGE': return '💬';
      case 'ALERT': return '⚠️';
      default: return '🔔';
    }
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

  private setNames(fullName: string) {
    if (!fullName) return;
    const parts = fullName.split(' ');
    this.firstName = parts[0];
    this.initials = parts.map(n => n ? n[0] : '').join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0].toUpperCase();
  }
}
