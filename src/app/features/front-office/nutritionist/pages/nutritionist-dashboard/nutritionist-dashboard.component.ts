import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { UserResponseDTO } from '../../../../../models/user.model';

@Component({
    selector: 'app-nutritionist-dashboard',
    templateUrl: './nutritionist-dashboard.component.html',
    styleUrls: ['./nutritionist-dashboard.component.scss']
})
export class NutritionistDashboardComponent implements OnInit {
  firstName: string = 'Nutritionist';
  initials: string = 'N';

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    this.loadUserInfo();
    this.userService.getProfile().subscribe({
      next: (user: UserResponseDTO) => {
        if (user && user.fullName) {
          this.setNames(user.fullName);
        }
      },
      error: (err: any) => {
        console.error('Error fetching nutritionist profile', err);
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
