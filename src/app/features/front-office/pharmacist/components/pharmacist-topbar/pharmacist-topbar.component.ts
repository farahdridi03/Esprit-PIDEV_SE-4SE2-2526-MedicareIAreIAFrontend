import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pharmacist-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pharmacist-topbar.component.html',
  styleUrls: ['./pharmacist-topbar.component.scss']
})
export class PharmacistTopbarComponent implements OnInit {
  firstName: string = 'Pharmacist';
  initials: string = 'P';
  photo: string | null = null;
  notifications: any[] = [];
  unreadCount: number = 0;
  showNotifPanel: boolean = false;

  constructor(private userService: UserService, private authService: AuthService) { }

  ngOnInit() {
    this.loadUserInfo();
    this.userService.getProfile().subscribe({
      next: (user) => {
        if (user && user.fullName) {
          this.setNames(user.fullName);
        }
        if (user && user.photo) {
          this.photo = user.photo;
        }
      },
      error: (err) => {
        console.error('Error fetching pharmacist profile', err);
      }
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

  toggleNotifPanel(event: MouseEvent) {
    event.stopPropagation();
    this.showNotifPanel = !this.showNotifPanel;
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.isRead = true);
    this.unreadCount = 0;
  }

  markAsRead(n: any) {
    n.isRead = true;
    this.unreadCount = this.notifications.filter(notif => !notif.isRead).length;
  }

  getNotificationIcon(type: string): string {
    return '🔔';
  }
}
