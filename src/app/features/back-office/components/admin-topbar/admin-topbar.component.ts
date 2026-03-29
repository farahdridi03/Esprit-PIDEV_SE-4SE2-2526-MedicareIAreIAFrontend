import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService, AppNotification } from '../../../../services/notification.service';

@Component({
  selector: 'app-admin-topbar',
  templateUrl: './admin-topbar.component.html',
  styleUrls: ['./admin-topbar.component.scss']
})
export class AdminTopbarComponent implements OnInit, OnDestroy {
  notifications: AppNotification[] = [];
  unreadCount = 0;
  showDropdown = false;
  private sub!: Subscription;

  constructor(
    private notifService: NotificationService,
    private elRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.sub = this.notifService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
      this.unreadCount = notifs.filter(n => !n.read).length;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  markAllRead(): void {
    this.notifService.markAllRead();
  }

  clearAll(): void {
    this.notifService.clearAll();
  }

  getIcon(type: AppNotification['type']): string {
    if (type === 'aid_request') return '🤝';
    if (type === 'warning') return '⚠️';
    return 'ℹ️';
  }

  timeAgo(date: Date | string): string {
    const d = new Date(date);
    const diffMs = Date.now() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'À l\'instant';
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Il y a ${diffH}h`;
    return `Il y a ${Math.floor(diffH / 24)}j`;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }
}
