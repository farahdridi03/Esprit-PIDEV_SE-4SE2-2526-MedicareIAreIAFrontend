// src/app/features/front-office/doctor/components/doctor-topbar/doctor-topbar.component.ts

import { Component, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { NotificationService } from '../../../../../services/notification.service';

@Component({
  selector: 'app-doctor-topbar',
  templateUrl: './doctor-topbar.component.html',
  styleUrls: ['./doctor-topbar.component.scss']
})
export class DoctorTopbarComponent implements OnInit, OnDestroy {
  firstName: string = 'Doctor';
  initials: string = 'D';

  doctorId: number = 0;
  unreadCount: number = 0;
  panelOpen: boolean = false;

  private unreadSub!: Subscription;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private notifService: NotificationService,
    private eRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();

    this.userService.getProfile().subscribe({
      next: (user) => {
        if (user && user.fullName) {
          this.setNames(user.fullName);
        }
      },
      error: (err) => {
        console.error('Error fetching doctor profile', err);
      }
    });

    this.doctorId = this.authService.getUserId();
    
    // Connect to WebSocket via the centralized service
    this.notifService.connectWebSocket(this.doctorId);
    
    this.unreadSub = this.notifService.unreadCount.subscribe(count => {
      this.unreadCount = count;
    });
  }

  ngOnDestroy(): void {
    if (this.unreadSub) {
      this.unreadSub.unsubscribe();
    }
    this.notifService.disconnectWebSocket();
  }

  togglePanel(): void {
    this.panelOpen = !this.panelOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.panelOpen = false;
    }
  }

  private loadUserInfo(): void {
    const fullName = this.authService.getUserFullName();
    if (fullName) {
      this.setNames(fullName);
    }
  }

  private setNames(fullName: string): void {
    if (!fullName) return;
    const parts = fullName.split(' ');
    this.firstName = parts[0];
    this.initials = parts.map(n => n ? n[0] : '').join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0].toUpperCase();
  }
}
