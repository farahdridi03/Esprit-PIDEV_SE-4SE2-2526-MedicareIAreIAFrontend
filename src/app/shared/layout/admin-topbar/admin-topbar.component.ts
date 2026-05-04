import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { EventService } from '../../../services/event.service';
import { WebsocketService } from '../../../services/websocket.service';
import { Notification } from '../../../models/notification.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-admin-topbar',
    templateUrl: './admin-topbar.component.html',
    styleUrls: ['./admin-topbar.component.scss']
})
export class AdminTopbarComponent implements OnInit, OnDestroy {
    firstName: string = 'Admin';
    initials: string = 'AD';
    notifications: Notification[] = [];
    unreadCount: number = 0;
    showNotifications: boolean = false;
    userRole: string | null = null;
    isPharmacist: boolean = false;
    isAdmin: boolean = false;
    private wsSubscription: Subscription | null = null;

    constructor(
        private userService: UserService, 
        private authService: AuthService,
        private notifService: NotificationService,
        private eventService: EventService,
        private wsService: WebsocketService,
        private router: Router
    ) { }

    ngOnInit() {
        const rawRole = this.authService.getUserRole();
        this.userRole = rawRole ? rawRole.toUpperCase() : null;
        this.isPharmacist = this.userRole === 'PHARMACIST';
        this.isAdmin = this.userRole === 'ADMIN';

        this.loadUserInfo();
        this.userService.getProfile().subscribe({
            next: (user) => {
                if (user && user.fullName) {
                    this.setNames(user.fullName);
                }
            }
        });

        // Load notifications immediately
        this.fetchNotifications();

        // Connect to WebSocket
        const email = this.authService.getUserEmail();
        if (email) {
            this.wsService.connect(email);
            this.wsSubscription = this.wsService.getNotifications().subscribe(notif => {
                this.notifications = [notif, ...this.notifications];
                this.unreadCount++;
                // Optional: Show a toast or sound
            });
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
            },
            error: (err) => console.error('Error fetching notifications', err)
        });
    }

    toggleNotifications() {
        this.showNotifications = !this.showNotifications;
    }

    markAllRead() {
        this.notifService.markAllRead().subscribe({
            next: () => {
                this.notifications.forEach(n => n.isRead = true);
                this.unreadCount = 0;
            }
        });
    }

    deleteNotification(id: number, event: MouseEvent) {
        event.stopPropagation();
        this.notifService.deleteNotification(id).subscribe({
            next: () => {
                this.notifications = this.notifications.filter(n => n.id !== id);
                this.unreadCount = this.notifications.filter(n => !n.isRead).length;
            }
        });
    }

    clearAll() {
        this.notifService.clearAll().subscribe({
            next: () => {
                this.notifications = [];
                this.unreadCount = 0;
            }
        });
    }

    acceptParticipation(participationId: number | undefined, notif: Notification, event: MouseEvent) {
        event.stopPropagation();
        if (!participationId) return;

        this.eventService.acceptParticipation(participationId).subscribe({
            next: () => {
                notif.participationStatus = 'CONFIRMED';
            },
            error: (err) => console.error('Error accepting participation', err)
        });
    }

    rejectParticipation(participationId: number | undefined, notif: Notification, event: MouseEvent) {
        event.stopPropagation();
        if (!participationId) return;

        this.eventService.rejectParticipation(participationId).subscribe({
            next: () => {
                notif.participationStatus = 'REJECTED';
            },
            error: (err) => console.error('Error rejecting participation', err)
        });
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
            },
            error: (err) => console.error('Error downloading ticket', err)
        });
    }

    openNotification(notif: Notification) {
        this.notifService.markAsRead(notif.id).subscribe();
        notif.isRead = true;
        this.unreadCount = this.notifications.filter(n => !n.isRead).length;
        this.showNotifications = false;

        switch (notif.type) {
            case 'EVENT_JOIN':
                if (notif.targetId) {
                    this.router.navigate(['/admin/events', notif.targetId, 'registrations']);
                }
                break;
            case 'EVENT_SUGGESTION':
                this.router.navigate(['/admin/event-suggestions']);
                break;
            default:
                if (notif.targetId) {
                    this.router.navigate(['/admin/events', notif.targetId]);
                }
                break;
        }
    }

    goToEvent(eventId: number, notifId: number) {
        this.notifService.markAsRead(notifId).subscribe();
        this.router.navigate(['/admin/events', eventId]);
        this.showNotifications = false;
    }


    private loadUserInfo() {
        const fullName = this.authService.getUserFullName();
        if (fullName) {
            this.setNames(fullName);
        }
    }

    private setNames(fullName: string) {
        if (!fullName) return;
        const parts = fullName.split(' ');
        this.firstName = parts[0];
        this.initials = parts.map(n => n ? n[0] : '').join('').toUpperCase();
        if (!this.initials) this.initials = this.firstName[0].toUpperCase();
    }
}
