import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { NotificationService } from '../../../../../services/notification.service';
import { Notification } from '../../../../../models/notification.model';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit, OnDestroy {
  firstName: string = 'User';
  initials: string = 'U';
  notifications: Notification[] = [];
  unreadCount: number = 0;
  showNotifications: boolean = false;
  private pollingInterval: any;

  constructor(
    private userService: UserService, 
    private authService: AuthService,
    private notifService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.userService.getProfile().subscribe({
      next: (user) => {
        if (user && user.fullName) {
          this.setNames(user.fullName);
        }
      },
      error: (err) => {
        console.error('Error fetching user profile', err);
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

  markRead(notifId: number) {
    this.notifService.markAsRead(notifId).subscribe();
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

  downloadTicket(notif: Notification, event: MouseEvent) {
    event.stopPropagation();
    const ticketElement = document.getElementById('ticket-' + notif.id);
    if (!ticketElement) return;

    html2canvas(ticketElement, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 120;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center on page
      const x = (210 - imgWidth) / 2;
      
      pdf.setFillColor(245, 247, 250);
      pdf.rect(0, 0, 210, 297, 'F');
      
      pdf.setFontSize(22);
      pdf.setTextColor(26, 122, 94); // $primary color
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
