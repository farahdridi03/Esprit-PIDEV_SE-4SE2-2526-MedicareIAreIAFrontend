// src/app/features/front-office/doctor/components/notification-panel/notification-panel.component.ts

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NotificationService } from '../../../../../services/notification.service';
import { NotificationDTO } from '../../../../../models/notification.model';

@Component({
  selector: 'app-notification-panel',
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.scss']
})
export class NotificationPanelComponent implements OnInit {
  @Input() doctorId!: number;
  @Output() unreadChange = new EventEmitter<number>();

  notifications: NotificationDTO[] = [];
  loading = true;
  filter: 'all' | 'unread' = 'all';

  constructor(private notifService: NotificationService) {}

  ngOnInit(): void {
    // Initial load
    this.loadNotifications();
    
    // Subscribe to real-time updates from centralized service
    this.notifService.notifications.subscribe(data => {
      this.notifications = data;
      this.unreadChange.emit(this.unreadCount);
    });
  }

  loadNotifications(): void {
    this.loading = true;
    const source$ = this.filter === 'all'
      ? this.notifService.getNotifications(this.doctorId)
      : this.notifService.getUnread(this.doctorId);

    source$.subscribe({
      next: (data) => {
        this.notifications = data;
        this.loading = false;
        this.unreadChange.emit(this.unreadCount);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  markOne(notif: NotificationDTO, event: Event): void {
    event.stopPropagation();
    if (notif.read) return;
    this.notifService.markAsRead(this.doctorId, notif.id).subscribe({
      next: (updated) => {
        notif.read = true;
        this.unreadChange.emit(this.unreadCount);
        this.notifService.refreshUnreadCount(this.doctorId);
      },
      error: () => {}
    });
  }

  markAll(): void {
    this.notifService.markAllAsRead(this.doctorId).subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.unreadChange.emit(0);
        this.notifService.refreshUnreadCount(this.doctorId);
      },
      error: () => {}
    });
  }

  switchFilter(f: 'all' | 'unread'): void {
    if (this.filter === f) return;
    this.filter = f;
    this.loadNotifications();
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  timeAgo(isoStr: string): string {
    const date = new Date(isoStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }
}
