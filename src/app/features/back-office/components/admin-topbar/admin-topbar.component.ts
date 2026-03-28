import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { NotificationService } from '../../../../services/notification.service';
import { NotificationResponseDTO } from '../../../../models/notification.model';
import { DeliveryTrackingService } from '../../../../services/delivery-tracking.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-admin-topbar',
    templateUrl: './admin-topbar.component.html',
    styleUrls: ['./admin-topbar.component.scss']
})
export class AdminTopbarComponent implements OnInit, OnDestroy {
    notifications: NotificationResponseDTO[] = [];
    unreadCount: number = 0;
    showNotifications = false;
    private notifSub!: Subscription;

    constructor(
        public authService: AuthService,
        private notificationService: NotificationService,
        private deliveryTrackingService: DeliveryTrackingService,
        private router: Router
    ) {}

    ngOnInit(): void {
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

    toggleNotifications(event: MouseEvent): void {
        event.stopPropagation();
        this.showNotifications = !this.showNotifications;
    }

    markAsRead(notification: NotificationResponseDTO): void {
        if (notification.isRead) return;
        this.notificationService.markAsRead(notification.id).subscribe({
            next: () => {
                notification.isRead = true;
                this.unreadCount = Math.max(0, this.unreadCount - 1);
            }
        });
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
        return '🔔';
    }

    ngOnDestroy(): void {
        if (this.notifSub) this.notifSub.unsubscribe();
        this.deliveryTrackingService.disconnect();
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }
}
