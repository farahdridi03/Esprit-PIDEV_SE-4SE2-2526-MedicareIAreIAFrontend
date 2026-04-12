import { Component, OnInit } from '@angular/core';
import { UserService, UserProfile } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-laboratory-dashboard',
  templateUrl: './laboratory-dashboard.component.html',
  styleUrls: ['./laboratory-dashboard.component.scss']
})
export class LaboratoryDashboardComponent implements OnInit {
  fullName: string = '';

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.userService.getProfile().subscribe({
      next: (user: UserProfile) => {
        if (user && user.fullName) this.fullName = user.fullName;
      },
      error: (err: any) => {
        console.error('Error fetching laboratory profile', err);
      }
    });
  }

  private loadUserInfo() {
    const fullName = this.authService.getUserFullName();
    if (fullName) this.fullName = fullName;
  }
}
