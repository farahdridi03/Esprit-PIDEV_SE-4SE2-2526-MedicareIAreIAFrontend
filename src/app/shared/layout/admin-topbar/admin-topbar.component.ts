import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { EventService } from '../../../services/event.service';
import { Notification } from '../../../models/notification.model';
import { Router } from '@angular/router';

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
    private pollingInterval: any;

    constructor(
        private userService: UserService, 
        private authService: AuthService,
        private notifService: NotificationService,
        private eventService: EventService,
        private router: Router
    ) { }

    ngOnInit() {
        const rawRole = this.authService.getUserRole();
        this.userRole = rawRole ? rawRole.toUpperCase() : null;
        this.isPharmacist = this.userRole === 'PHARMACIST';

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

        // Poll every 30 seconds
        this.pollingInterval = setInterval(() => {
            this.fetchNotifications();
        }, 30000);
    }

    ngOnDestroy() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
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
