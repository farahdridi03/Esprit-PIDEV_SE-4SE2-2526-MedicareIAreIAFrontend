import { Component, OnInit } from '@angular/core';
import { UserService, UserProfile } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-nutritionist-topbar',
  templateUrl: './nutritionist-topbar.component.html',
  styleUrls: ['./nutritionist-topbar.component.scss']
})
export class NutritionistTopbarComponent implements OnInit {
  firstName: string = 'Nutritionist';
  initials: string = 'N';
  photo: string | null = null;

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    this.loadUserInfo();
    this.userService.getProfile().subscribe({
      next: (user: UserProfile) => {
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
    if (fullName) this.setNames(fullName);
  }

  private setNames(fullName: string) {
    if (!fullName) return;
    const parts = fullName.split(' ');
    this.firstName = parts[0];
    this.initials = parts.map(n => n ? n[0] : '').join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0].toUpperCase();
  }
}
