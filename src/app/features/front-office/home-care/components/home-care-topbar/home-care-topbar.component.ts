import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
    selector: 'app-home-care-topbar',
    templateUrl: './home-care-topbar.component.html',
    styleUrls: ['./home-care-topbar.component.scss']
})
export class HomeCareTopbarComponent implements OnInit {
  firstName: string = 'Provider';
  initials: string = 'H';
  photo: string | null = null;

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    this.loadUserInfo();
    this.userService.getProfile().subscribe({
      next: (user) => {
        if (user && user.fullName) {
          this.setNames(user.fullName);
        }
        this.photo = (user as any).photo || null;
      },
      error: (err) => {
        console.error('Error fetching home care profile', err);
      }
    });
  }

  private loadUserInfo() {
    this.userService.profile$.subscribe(user => {
      if (user) {
        if (user.fullName) {
          this.setNames(user.fullName);
        }
        this.photo = (user as any).photo || null;
      }
    });
    // Trigger initial load if not already loaded
    this.userService.refreshProfile();
  }

  private setNames(fullName: string) {
    if (!fullName) return;
    const parts = fullName.split(' ');
    this.firstName = parts[0];
    this.initials = parts.map(n => n ? n[0] : '').join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0].toUpperCase();
  }
}
