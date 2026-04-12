import { Component, OnInit } from '@angular/core';
import { UserService, UserProfile } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit {
  fullName: string = '';

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.userService.getProfile().subscribe({
      next: (user: UserProfile) => {
        if (user && user.fullName) this.fullName = user.fullName;
      },
      error: (err: any) => {
        console.error('Error fetching doctor profile', err);
      }
    });
  }

  private loadUserInfo() {
    const fullName = this.authService.getUserFullName();
    if (fullName) this.fullName = fullName;
  }
}
