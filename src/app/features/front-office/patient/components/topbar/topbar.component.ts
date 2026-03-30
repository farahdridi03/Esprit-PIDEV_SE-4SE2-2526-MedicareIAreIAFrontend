import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { PatientService } from '../../../../../services/patient.service';
import { NotificationService, AppNotification } from '../../../../../services/notification.service';

@Component({
  selector: 'app-patient-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit, OnDestroy {
  firstName: string = 'User';
  initials: string = 'U';
  photo: string | null = null;
  currentUserId: number | null = null;

  // Notifications
  notifications: AppNotification[] = [];
  unreadCount = 0;
  showDropdown = false;
  
  private pollInterval: any;
  private profileSub?: Subscription;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private patientService: PatientService,
    private notifService: NotificationService,
    private elRef: ElementRef
  ) {}

  ngOnInit() {
    // 1. Name and ID from token (immediate)
    const nameFromToken = this.authService.getUserFullName();
    if (nameFromToken) {
      this.setNames(nameFromToken);
    }
    this.currentUserId = this.authService.getUserId();

    // 2. React to profile$ stream updates
    this.profileSub = this.userService.profile$.subscribe(user => {
      if (user) {
        if (user.fullName) this.setNames(user.fullName);
        if ((user as any).photo) this.photo = (user as any).photo;
        if ((user as any).profileImage) this.photo = (user as any).profileImage;
      }
    });

    // 3. Start Notification Polling
    this.startPolling();

    // 4. Fetch Patient Profile specifically for the photo
    this.patientService.getMe().subscribe({
      next: (patient) => {
        if (patient) {
          if (patient.fullName) this.setNames(patient.fullName);
          this.userService.setProfile({ photo: patient.photo ?? undefined } as any);
          this.photo = patient.photo || null;
        }
      },
      error: () => {}
    });
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.profileSub?.unsubscribe();
  }

  private setNames(fullName: string) {
    if (!fullName) return;
    const parts = fullName.trim().split(/\s+/);
    this.firstName = parts[0];
    this.initials = parts.map(n => (n ? n[0] : '')).join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0]?.toUpperCase() || 'U';
  }

  // ==== NOTIFICATIONS ====
  private startPolling(): void {
    if (this.currentUserId) {
      this.refreshNotifs();
      this.pollInterval = setInterval(() => this.refreshNotifs(), 3000);
    }
  }

  private refreshNotifs(): void {
    if (!this.currentUserId) return;
    this.notifications = this.notifService.getPatientNotifications(this.currentUserId);
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  markAllRead(): void {
    if (this.currentUserId) {
      this.notifService.markPatientNotificationsRead(this.currentUserId);
      this.refreshNotifs();
    }
  }

  clearAll(): void {
    if (this.currentUserId) {
      this.notifService.clearPatientNotifications(this.currentUserId);
      this.refreshNotifs();
    }
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
