import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { UserResponseDTO } from '../../../../../models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  firstName: string = 'User';

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    const fullNameFromToken = this.authService.getUserFullName();
    if (fullNameFromToken) {
      this.firstName = fullNameFromToken.trim().split(' ')[0];
    }

    this.userService.getProfile().subscribe({
      next: (user: UserResponseDTO) => {
        if (user && user.fullName) {
          this.firstName = user.fullName.trim().split(' ')[0];
        }
      },
      error: (err: any) => console.error('Error fetching user profile for dashboard', err)
    });
  }
}
