import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  firstName: string = 'User';

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    // 1. Try to get name directly from JWT token
    const fullNameFromToken = this.authService.getUserFullName();
    if (fullNameFromToken) {
      this.firstName = fullNameFromToken.trim().split(' ')[0];
      return;
    }

    // 2. Fallback: get current user profile
    const email = this.authService.getUserEmail();
    if (email) {
      this.userService.getProfile().subscribe({
        next: (user) => {
          if (user && user.fullName) {
            this.firstName = user.fullName.trim().split(' ')[0];
          }
        },
        error: (err: any) => console.error('Error fetching user profile for dashboard', err)
      });
    }
  }
}
