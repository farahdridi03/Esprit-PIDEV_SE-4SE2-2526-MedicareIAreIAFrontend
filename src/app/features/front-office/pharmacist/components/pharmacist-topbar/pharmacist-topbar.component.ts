import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { NotificationService, AppNotification } from '../../../../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pharmacist-topbar',
  templateUrl: './pharmacist-topbar.component.html',
  styleUrls: ['./pharmacist-topbar.component.scss']
})
export class PharmacistTopbarComponent implements OnInit, OnDestroy {
  firstName: string = 'Pharmacist';
  initials: string = 'P';
  photo: string | null = null;

  notifications: AppNotification[] = [];
  unreadCount: number = 0;
  showNotifPanel: boolean = false;

  private notifSub?: Subscription;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.userService.profile$.subscribe(user => {
      if (user) {
        if (user.fullName) {
          this.setNames(user.fullName);
        }
        this.photo = (user as any).photo || null;
      }
    });
    this.userService.refreshProfile();

    this.notifSub = this.notificationService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
      this.unreadCount = notifs.filter(n => !n.read).length;
    });
  }

  ngOnDestroy() {
    this.notifSub?.unsubscribe();
  }

  toggleNotifPanel(event?: Event) {
    if (event) event.stopPropagation();
    this.showNotifPanel = !this.showNotifPanel;
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'aid_request': return '🤝';
      case 'warning': return '⚠️';
      default: return '🔔';
    }
  }

  markAsRead(notif: AppNotification) {
    if (!notif.read) {
      this.notificationService.markRead(notif.id);
    }
  }

  markAllAsRead() {
    this.notificationService.markAllRead();
  }

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
