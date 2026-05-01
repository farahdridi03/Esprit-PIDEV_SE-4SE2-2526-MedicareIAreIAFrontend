import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { NotificationService } from '../../../../services/notification.service';
import { EventService } from '../../../../services/event.service';
import { WebsocketService } from '../../../../services/websocket.service';
import { Notification } from '../../../../models/notification.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-front-layout',
  templateUrl: './front-layout.component.html',
  styleUrls: ['./front-layout.component.scss']
})
export class FrontLayoutComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  showNotifications = false;
  private wsSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private notifService: NotificationService,
    private eventService: EventService,
    private wsService: WebsocketService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      this.fetchNotifications();
      
      const email = this.authService.getUserEmail();
      if (email) {
        this.wsService.connect(email);
        this.wsSubscription = this.wsService.getNotifications().subscribe(notif => {
          this.notifications = [notif, ...this.notifications];
          this.unreadCount++;
        });
      }
    }
  }

  ngOnDestroy() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.wsService.disconnect();
  }

  fetchNotifications() {
    this.notifService.getNotifications().subscribe({
      next: (notifs) => {
        this.notifications = notifs;
        this.unreadCount = notifs.filter(n => !n.isRead).length;
      }
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  downloadTicket(participationId: number | undefined, event: MouseEvent) {
    event.stopPropagation();
    if (!participationId) return;

    this.eventService.downloadTicket(participationId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${participationId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  markAllRead() {
    this.notifService.markAllRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
