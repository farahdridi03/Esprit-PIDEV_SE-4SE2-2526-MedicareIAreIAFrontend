import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';
import { DoctorService, DoctorProfile } from '../../../../../services/doctor.service';
import { UserService } from '../../../../../services/user.service';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css']
})
export class DoctorProfileComponent implements OnInit {
  doctor: DoctorProfile | null = null;
  loading = true;
  error: string | null = null;
  showPasswordModal = false;

  // password change fields
  newPassword = '';
  confirmPassword = '';
  passwordError = '';
  passwordSuccess = '';
  changingPassword = false;

  constructor(
    private authService: AuthService,
    private doctorService: DoctorService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const doctorId = this.authService.getUserId();
    if (doctorId) {
      this.doctorService.getProfile(doctorId).subscribe({
        next: (data) => {
          this.doctor = data;
          this.loading = false;
        },
        error: () => {
          // fallback: build minimal profile from auth token
          this.doctor = {
            id: doctorId,
            fullName: this.authService.getUserFullName() || 'Doctor',
            email: this.authService.getUserEmail() || '',
            licenseNumber: '',
            isProfileComplete: false
          };
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  onUpdate(): void {
    this.router.navigate(['/front/doctor/profile/edit']);
  }

  openPasswordModal(): void  { this.showPasswordModal = true; }
  closePasswordModal(): void { this.showPasswordModal = false; this.passwordError = ''; this.passwordSuccess = ''; this.newPassword = ''; this.confirmPassword = ''; }

  submitPassword(): void {
    this.passwordError = '';
    this.passwordSuccess = '';
    if (!this.newPassword || this.newPassword.length < 8) {
      this.passwordError = 'Password must be at least 8 characters.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Passwords do not match.';
      return;
    }
    this.changingPassword = true;
    this.userService.updateProfile({
      fullName: this.doctor?.fullName || '',
      email: this.doctor?.email || '',
      password: this.newPassword
    }).subscribe({
      next: () => {
        this.passwordSuccess = 'Password updated successfully.';
        this.changingPassword = false;
        setTimeout(() => this.closePasswordModal(), 1800);
      },
      error: () => {
        this.passwordError = 'Failed to update password. Please try again.';
        this.changingPassword = false;
      }
    });
  }
}
