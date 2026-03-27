import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
    selector: 'app-home-care-dashboard',
    templateUrl: './home-care-dashboard.component.html',
    styleUrls: ['./home-care-dashboard.component.scss']
})
export class HomeCareDashboardComponent implements OnInit {
  firstName: string = 'Provider';
  initials: string = 'H';

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    this.loadUserInfo();
    this.userService.getProfile().subscribe({
      next: (user) => {
        if (user && user.fullName) {
          this.setNames(user.fullName);
        }
      },
      error: (err) => {
        console.error('Error fetching home care provider profile', err);
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
}
