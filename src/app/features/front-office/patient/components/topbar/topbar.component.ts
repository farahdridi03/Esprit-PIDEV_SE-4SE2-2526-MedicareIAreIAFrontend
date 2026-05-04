import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { PatientService } from '../../../../../services/patient.service';
import { NotificationService, AppNotification } from '../../../../../services/notification.service';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit, OnDestroy {
  firstName: string = 'User';
  initials: string = 'U';
  photo: string | null = null;

  notifications: any[] = [];
  unreadCount: number = 0;
  showNotifications: boolean = false;

  private profileSub?: Subscription;
  private notifSub?: Subscription;
  private pollingInterval: any;

  constructor(
    private userService: UserService,
    public authService: AuthService,
    private patientService: PatientService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    const nameFromToken = this.authService.getUserFullName();
    if (nameFromToken) {
      this.setNames(nameFromToken);
    }

    this.profileSub = this.userService.profile$.subscribe(user => {
      if (user) {
        if (user.fullName) this.setNames(user.fullName);
        if (user.photo) this.photo = user.photo;
      }
    });

    this.userService.refreshProfile();

    this.patientService.getMe().subscribe({
      next: (patient) => {
        if (patient) {
          if (patient.fullName) this.setNames(patient.fullName);
          this.userService.setProfile({ photo: patient.photo ?? undefined });
          this.photo = patient.photo || null;
        }
      },
      error: () => {}
    });

    this.fetchNotifications();

    this.pollingInterval = setInterval(() => {
      this.fetchNotifications();
    }, 30000);
  }

  ngOnDestroy() {
    this.profileSub?.unsubscribe();
    this.notifSub?.unsubscribe();
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  fetchNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (notifs: any[]) => {
        this.notifications = notifs;
        this.unreadCount = notifs.filter(n => !n.isRead && !n.read).length;
      },
      error: (err: any) => console.error('Error fetching notifications', err)
    });
  }

  toggleNotifications(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.showNotifications = !this.showNotifications;
  }

  markAllAsRead(userId?: number) {
    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.notifications.forEach(n => { n.isRead = true; n.read = true; });
        this.unreadCount = 0;
      }
    });
  }

  markRead(notifId: number | string) {
    this.notificationService.markAsRead(notifId).subscribe();
  }

  deleteNotification(id: number | string, event: MouseEvent) {
    event.stopPropagation();
    this.notificationService.deleteNotification(id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.unreadCount = this.notifications.filter(n => !n.isRead && !n.read).length;
      }
    });
  }

  clearAll() {
    this.notificationService.clearAll().subscribe({
      next: () => {
        this.notifications = [];
        this.unreadCount = 0;
      }
    });
  }

  downloadTicket(notif: any, event: MouseEvent) {
    event.stopPropagation();
    const ticketElement = document.getElementById('ticket-' + notif.id);
    if (!ticketElement) return;

    html2canvas(ticketElement, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 120;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const x = (210 - imgWidth) / 2;
      
      pdf.setFillColor(245, 247, 250);
      pdf.rect(0, 0, 210, 297, 'F');
      
      pdf.setFontSize(22);
      pdf.setTextColor(26, 122, 94);
      pdf.text('MEDICARE AI', 105, 30, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Your Official Event Ticket', 105, 40, { align: 'center' });
      
      pdf.addImage(imgData, 'PNG', x, 60, imgWidth, imgHeight);
      
      pdf.setFontSize(10);
      pdf.text('Please present this ticket at the event entrance.', 105, 60 + imgHeight + 20, { align: 'center' });
      
      pdf.save(`ticket-${notif.eventTitle?.replace(/\s+/g, '-')}-${notif.participationId}.pdf`);
    });
  }

  private setNames(fullName: string) {
    if (!fullName) return;
    const parts = fullName.trim().split(/\s+/);
    this.firstName = parts[0];
    this.initials = parts.map(n => (n ? n[0] : '')).join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0]?.toUpperCase() || 'U';
  }

  navigateToRelated(notification: any) {
    this.markRead(notification.id);
    this.showNotifications = false;
    if (notification.orderId) {
      this.router.navigate(['/front/patient/pharmacy-orders', notification.orderId]);
    }
  }

  getNotificationIcon(type: string): string {
    if (!type) return '🔔';
    if (type.includes('VALIDATED') || type.includes('CONFIRMED')) return '✅';
    if (type.includes('DELIVERY')) return '🚚';
    if (type.includes('CANCELLED') || type.includes('REJECTED')) return '❌';
    return '🔔';
  }
}
