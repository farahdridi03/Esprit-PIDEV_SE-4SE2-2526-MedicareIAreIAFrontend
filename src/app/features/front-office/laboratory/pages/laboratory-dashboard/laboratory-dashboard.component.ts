import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { UserResponseDTO } from '../../../../../models/user.model';

@Component({
    selector: 'app-laboratorystaff-dashboard',
    templateUrl: './laboratory-dashboard.component.html',
    styleUrls: ['./laboratory-dashboard.component.scss']
})
export class LaboratoryStaffDashboardComponent implements OnInit {
  firstName: string = 'Staff';

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    // Initial load from token
    const fullName = this.authService.getUserFullName();
    if (fullName) {
      this.firstName = fullName.split(' ')[0];
    }

    // Refresh from profile API
    this.userService.getProfile().subscribe({
      next: (user: UserResponseDTO) => {
        if (user && user.fullName) {
          this.firstName = user.fullName.split(' ')[0];
        }
      },
      error: (err: any) => {
        console.error('Error fetching laboratory staff profile', err);
      }
    });
  }
}
