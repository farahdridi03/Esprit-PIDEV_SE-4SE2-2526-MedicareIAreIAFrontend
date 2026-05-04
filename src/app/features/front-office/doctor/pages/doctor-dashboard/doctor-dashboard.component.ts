import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit {
  firstName: string = 'Doctor';

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    // Initial load from token
    const fullName = this.authService.getUserFullName();
    if (fullName) {
      this.firstName = fullName.split(' ')[0];
    }

    // Refresh from profile API
    this.userService.getProfile().subscribe({
      next: (user) => {
        if (user && user.fullName) {
          this.firstName = user.fullName.split(' ')[0];
        }
      },
      error: (err) => {
        console.error('Error fetching doctor profile', err);
      }
    });
  }
}
