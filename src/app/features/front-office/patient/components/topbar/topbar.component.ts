import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { WebsocketService } from '../../../../../services/websocket.service';
import { BabyCareService } from '../../../../../services/baby-care.service';

@Component({
  selector: 'app-patient-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class PatientTopbarComponent implements OnInit {
  firstName: string = 'User';
  initials: string = 'U';
  unreadCount: number = 0;
  notifications: any[] = [];
  panelOpen: boolean = false;

  constructor(
    private userService: UserService, 
    private authService: AuthService,
    private websocketService: WebsocketService,
    private babyService: BabyCareService
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

    this.initNotifications();
  }

  private initNotifications() {
    const userId = this.authService.getUserId();
    if (userId) {
      // Connect to WebSocket
      this.websocketService.connect(userId);
      
      // Listen for new notifications
      this.websocketService.getNotifications().subscribe(notif => {
        if (notif) {
          console.log('Global notification received:', notif);
          // Check if it's already in the list
          const exists = this.notifications.some(n => n.id === notif.id && n.title === notif.title);
          if (!exists) {
            this.notifications.unshift(notif);
            this.unreadCount++;
          }
        }
      });

      // Load existing unread reminders for this parent's babies
      this.babyService.getProfilesByPatientId(userId).subscribe(profiles => {
        let allUnread: any[] = [];
        let count = 0;
        if (profiles.length === 0) return;
        
        profiles.forEach(baby => {
          this.babyService.getReminders(baby.id).subscribe((reminders: any[]) => {
            const unread = reminders.filter((r: any) => !r.status);
            allUnread = [...allUnread, ...unread];
            count++;
            if (count === profiles.length) {
              this.notifications = allUnread;
              this.unreadCount = this.notifications.length;
            }
          });
        });
      });
    }
  }

  togglePanel() {
    this.panelOpen = !this.panelOpen;
  }

  deleteNotification(id: number, event: Event) {
    event.stopPropagation(); // Prevent closing dropdown
    this.babyService.deleteReminder(id).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.id !== id);
      if (this.unreadCount > 0) this.unreadCount--;
    });
  }

  clearAll() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.babyService.deleteAllReminders(userId).subscribe(() => {
        this.notifications = [];
        this.unreadCount = 0;
      });
    }
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
