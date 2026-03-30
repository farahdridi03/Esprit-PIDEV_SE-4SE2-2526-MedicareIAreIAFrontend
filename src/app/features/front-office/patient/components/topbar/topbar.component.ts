<<<<<<< HEAD
import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { NotificationService, AppNotification } from '../../../../../services/notification.service';
=======
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { PatientService } from '../../../../../services/patient.service';
>>>>>>> origin/frontVersion1

@Component({
  selector: 'app-patient-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit, OnDestroy {
  firstName: string = 'User';
  initials: string = 'U';
<<<<<<< HEAD
  profileImage: string | null = null;
  currentUserId: number | null = null;

  notifications: AppNotification[] = [];
  unreadCount = 0;
  showDropdown = false;
  private pollInterval: any;
=======
  photo: string | null = null;

  private profileSub?: Subscription;
>>>>>>> origin/frontVersion1

  constructor(
    private userService: UserService,
    private authService: AuthService,
<<<<<<< HEAD
    private notifService: NotificationService,
    private elRef: ElementRef
  ) {}

  ngOnInit() {
    this.startPolling();

    // 1. Try to get name directly from JWT token
    const fullNameFromToken = this.authService.getUserFullName();
    if (fullNameFromToken) {
      this.setNames(fullNameFromToken);
    }

    // 2. Fetch current user profile to get profile picture
    const email = this.authService.getUserEmail();
    if (email) {
      this.userService.getProfile().subscribe({
        next: (user) => {
          if (user) {
            if (user.fullName) this.setNames(user.fullName);
            this.profileImage = user.profileImage || null;
          }
        },
        error: (err: any) => console.error('Error fetching user profile for topbar', err)
      });
    }
=======
    private patientService: PatientService
  ) {}

  ngOnInit() {
    // 1. Immediately populate name from JWT — zero-delay, no flicker
    const nameFromToken = this.authService.getUserFullName();
    if (nameFromToken) {
      this.setNames(nameFromToken);
    }

    // 2. React to profile$ stream updates (name + photo)
    this.profileSub = this.userService.profile$.subscribe(user => {
      if (user) {
        if (user.fullName) this.setNames(user.fullName);
        if (user.photo) this.photo = user.photo;
      }
    });

    // 3. Try the legacy /user/profile (falls back to JWT on 500)
    this.userService.refreshProfile();

    // 4. Load the patient profile — the only reliable source for the photo field
    this.patientService.getMe().subscribe({
      next: (patient) => {
        if (patient) {
          if (patient.fullName) this.setNames(patient.fullName);
          // Push photo into the shared profile$ stream so everyone gets it
          this.userService.setProfile({ photo: patient.photo ?? undefined });
          this.photo = patient.photo || null;
        }
      },
      error: () => { /* silently ignore — name is already set from JWT */ }
    });
  }

  ngOnDestroy() {
    this.profileSub?.unsubscribe();
>>>>>>> origin/frontVersion1
  }

  private setNames(fullName: string) {
    if (!fullName) return;
<<<<<<< HEAD
    const parts = fullName.trim().split(' ');
=======
    const parts = fullName.trim().split(/\s+/);
>>>>>>> origin/frontVersion1
    this.firstName = parts[0];
    this.initials = parts.map(n => (n ? n[0] : '')).join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0]?.toUpperCase() || 'U';
  }

  // ==== NOTIFICATIONS ====
  private startPolling(): void {
    const id = this.authService.getUserId();
    if (id) {
      this.currentUserId = id;
      this.refreshNotifs();
      this.pollInterval = setInterval(() => this.refreshNotifs(), 3000);
    }
  }

  private refreshNotifs(): void {
    if (!this.currentUserId) return;
    this.notifications = this.notifService.getPatientNotifications(this.currentUserId);
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  ngOnDestroy(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
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
