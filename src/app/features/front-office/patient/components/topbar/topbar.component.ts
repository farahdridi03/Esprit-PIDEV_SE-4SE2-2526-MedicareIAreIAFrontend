import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit {
  firstName: string = 'User';
  initials: string = 'U';

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    // 1. Try to get name directly from JWT token
    const fullNameFromToken = this.authService.getUserFullName();
    if (fullNameFromToken) {
      this.setNames(fullNameFromToken);
      return;
    }

    // 2. Fallback: find user by email, then use their fullName
    const email = this.authService.getUserEmail();
    if (email) {
      this.userService.getAll().subscribe({
        next: (users) => {
          const user = users.find(u => u.email === email);
          if (user && user.fullName) {
            this.setNames(user.fullName);
          }
        },
        error: (err: any) => console.error('Error fetching users for topbar', err)
      });
    }
  }

  private setNames(fullName: string) {
    if (!fullName) return;
    const parts = fullName.trim().split(' ');
    this.firstName = parts[0];
    this.initials = parts.map(n => n ? n[0] : '').join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0].toUpperCase();
  }
}
