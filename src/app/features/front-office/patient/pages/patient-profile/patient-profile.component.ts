import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { PatientService } from '../../../../../services/patient.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.scss']
})
export class PatientProfileComponent implements OnInit {
  profileData: any = {
    fullName: '',
    email: '',
    password: '',
    phone: '',
    birthDate: '',
    gender: 'MALE',
    bloodType: 'O_POS',
    emergencyContactName: '',
    emergencyContactPhone: '',
    profileImage: ''
  };

  errorMessage: string = '';
  successMessage: string = '';
  patientId: number | null = null;

  constructor(
    private patientService: PatientService, 
    private authService: AuthService,
    private userService: UserService
  ) { }

  // Handle profile photo selection
  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileData.profileImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  ngOnInit(): void {
    // Fill with email from token by default
    this.profileData.email = this.authService.getUserEmail?.() ?? '';
    this.patientId = this.authService.getUserId?.() ?? null;

    if (this.patientId) {
      // Retrieve full patient data
      this.patientService.getById(this.patientId).subscribe({
        next: (user: any) => {
          if (user) {
            this.profileData.fullName = user.fullName || '';
            this.profileData.email = user.email || '';
            this.profileData.phone = user.phone || '';
            this.profileData.birthDate = user.birthDate || '';
            this.profileData.gender = user.gender || 'MALE';
            this.profileData.bloodType = user.bloodType || 'O_POS';
            this.profileData.emergencyContactName = user.emergencyContactName || '';
            this.profileData.emergencyContactPhone = user.emergencyContactPhone || '';
          }
        },
        error: (err: any) => console.error('Could not load patient profile details', err)
      });
    }
  }


  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.patientId) {
       this.errorMessage = 'User not securely identified.';
       return;
    }

    const payload: any = { ...this.profileData };

    // Update patient details
    this.patientService.update(this.patientId, payload).subscribe({
      next: (response: any) => {
        console.log('Patient profile updated', response);
        this.successMessage = 'Your settings have been securely updated.';
      },
      error: (error: any) => {
        console.error('Error updating patient profile', error);
        this.errorMessage = 'Update error: ' + (error.error?.message || '');
      }
    });

    // If profile image changed, update via user service
    if (this.profileData.profileImage) {
      this.userService.updateProfile({ fullName: this.profileData.fullName, email: this.profileData.email, password: this.profileData.password, profileImage: this.profileData.profileImage }).subscribe({
        next: () => console.log('Profile image updated'),
        error: err => console.error('Error updating profile image', err)
      });
    }
  }
}
