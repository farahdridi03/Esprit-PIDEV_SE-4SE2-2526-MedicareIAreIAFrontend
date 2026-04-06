import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { UserResponseDTO } from '../../../../../models/user.model';

@Component({
  selector: 'app-doctor-topbar',
  templateUrl: './doctor-topbar.component.html',
  styleUrls: ['./doctor-topbar.component.scss']
})
export class DoctorTopbarComponent implements OnInit {
  firstName: string = 'Doctor';
  initials: string = 'D';
  photo: string | null = null;

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    this.loadUserInfo();

    // The profile endpoint is optional/missing on backend, names are loaded from authService token

    this.userService.getProfile().subscribe({
      next: (user: UserResponseDTO) => {
        if (user && user.fullName) {
          this.setNames(user.fullName);
        }
      },
      error: (err: any) => {
        console.error('Error fetching doctor profile', err);
      }
    });

  }

  private loadUserInfo() {
    this.userService.profile$.subscribe(user => {
      if (user) {
        if (user.fullName) {
          this.setNames(user.fullName);
        }
        this.photo = (user as any).photo || null;
      }
    });
    // Trigger initial load if not already loaded
    this.userService.refreshProfile();
  }

  private setNames(fullName: string) {
    if (!fullName) return;
    const parts = fullName.split(' ');
    this.firstName = parts[0];
    this.initials = parts.map(n => n ? n[0] : '').join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0].toUpperCase();
  }
}
