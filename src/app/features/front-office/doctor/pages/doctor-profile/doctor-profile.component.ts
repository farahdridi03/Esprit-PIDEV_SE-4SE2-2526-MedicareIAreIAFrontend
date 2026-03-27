import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css']
})
export class DoctorProfileComponent implements OnInit {
  fullName: string = 'Dr. Sarah Johnson';
  email: string = 'sarah.johnson@example.com';
  password?: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private userService: UserService, private authService: AuthService) { }

  ngOnInit() {
    this.email = this.authService.getUserEmail() || '';
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    const request: any = { fullName: this.fullName, email: this.email };
    if (this.password) {
      request.password = this.password;
    }

    this.userService.updateProfile(request).subscribe({
      next: (response: any) => {
        console.log('Profile updated', response);
        this.successMessage = 'Profile updated successfully.';
        // Optionnel : Mettre à jour le token si le backend en renvoie un nouveau
      },
      error: (error: any) => {
        console.error('Error updating profile', error);
        this.errorMessage = 'Error updating profile.';
      }
    });
  }
}
