import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { UserResponseDTO } from '../../../../../models/user.model';

@Component({
    selector: 'app-laboratorystaff-topbar',
    templateUrl: './laboratory-topbar.component.html',
    styleUrls: ['./laboratory-topbar.component.scss']
})
export class LaboratoryStaffTopbarComponent implements OnInit {
  firstName: string = 'Staff';
  initials: string = 'L';
  photo: string | null = null;

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    this.loadUserInfo();
    this.userService.getProfile().subscribe({
      next: (user: UserResponseDTO) => {
        if (user && user.fullName) {
          this.setNames(user.fullName);
        }
        this.photo = (user as any).photo || null;
      },
      error: (err: any) => {
        console.error('Error fetching laboratory staff profile', err);
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
