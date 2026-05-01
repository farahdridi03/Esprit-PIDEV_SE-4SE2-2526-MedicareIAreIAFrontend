import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { WebSocketNotificationService, WsNotification } from '../../../../../services/websocket-notification.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit, OnDestroy {
  firstName: string = 'User';
  initials: string = 'U';
  profileImage: string | null = null;
  currentUserId: number | null = null;

  notifications: WsNotification[] = [];
  unreadCount = 0;
  showDropdown = false;

  private sub!: Subscription;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private wsNotif: WebSocketNotificationService,
    private elRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Nom & photo depuis le token / profil
    const fullNameFromToken = this.authService.getUserFullName();
    if (fullNameFromToken) this.setNames(fullNameFromToken);

    const email = this.authService.getUserEmail();
    if (email) {
      this.userService.getProfile().subscribe({
        next: (user) => {
          if (user?.fullName) this.setNames(user.fullName);
          this.profileImage = user?.profileImage || null;
        },
        error: (err: any) => console.error('Error fetching user profile', err)
      });
    }

    // WebSocket — abonnement patient
    const id = this.authService.getUserId();
    if (id) {
      this.currentUserId = id;
      this.wsNotif.connect();
      this.wsNotif.subscribeAsPatient(id);

      this.sub = this.wsNotif.patientNotifications$.subscribe(notifs => {
        this.notifications = notifs;
        this.unreadCount = notifs.filter(n => !n.read).length;
      });
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.wsNotif.unsubscribePatient();
  }

  private setNames(fullName: string): void {
    if (!fullName) return;
    const parts = fullName.trim().split(' ');
    this.firstName = parts[0];
    this.initials = parts.map(n => n ? n[0] : '').join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0].toUpperCase();
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  markAllRead(): void {
    this.wsNotif.markPatientRead();
  }

  clearAll(): void {
    this.wsNotif.clearPatient();
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
