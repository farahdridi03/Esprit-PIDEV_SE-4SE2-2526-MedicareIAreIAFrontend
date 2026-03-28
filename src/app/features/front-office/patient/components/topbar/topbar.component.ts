import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService, UserProfile } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { NotificationService } from '../../../../../services/notification.service';
import { NotificationResponseDTO } from '../../../../../models/notification.model';
import { DeliveryTrackingService } from '../../../../../services/delivery-tracking.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit, OnDestroy {
  firstName: string = 'Patient';
  initials: string = 'P';
  notifications: NotificationResponseDTO[] = [];
  unreadCount: number = 0;
  showNotifications = false;
  private notifSub!: Subscription;

  constructor(
    private userService: UserService, 
    public authService: AuthService,
    private notificationService: NotificationService,
    private deliveryTrackingService: DeliveryTrackingService,
    private router: Router
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
        console.error('Error fetching patient profile', err);
      }
    });

    const userId = this.authService.getUserId();
    const email = this.authService.getUserEmail();

    if (userId) {
      // Chargement initial
      this.notificationService.getNotifications(userId).subscribe();
      
      // Abonnement aux flux réactifs de NotificationService
      this.notifSub = this.notificationService.notifications$.subscribe(notifs => {
        this.notifications = notifs;
      });
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      });

      // Connexion WebSocket pour le temps réel (notifications privées)
      if (email) {
        this.deliveryTrackingService.connectToUserNotifications(email);
      }
    }
  }

  ngOnDestroy(): void {
      if (this.notifSub) this.notifSub.unsubscribe();
      this.deliveryTrackingService.disconnect();
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


  toggleNotifications(event: MouseEvent) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(notification: NotificationResponseDTO) {
    if (notification.isRead) return;
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    });
  }

  markAllAsRead(userId: number) {
    this.notificationService.markAllAsRead(userId).subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.unreadCount = 0;
      }
    });
  }

  navigateToRelated(notification: NotificationResponseDTO) {
    this.markAsRead(notification);
    this.showNotifications = false;
    
    if (notification.orderId) {
      if (notification.type.includes('ORDER') || notification.type.includes('DELIVERY') || notification.type.includes('PAYMENT')) {
        this.router.navigate(['/front/patient/pharmacy-orders', notification.orderId]);
      }
    }
  }

  getNotificationIcon(type: string): string {
    if (type.includes('VALIDATED') || type.includes('CONFIRMED')) return '✅';
    if (type.includes('DELIVERY')) return '🚚';
    if (type.includes('CANCELLED') || type.includes('REJECTED')) return '❌';
    return '🔔';
  }
}
