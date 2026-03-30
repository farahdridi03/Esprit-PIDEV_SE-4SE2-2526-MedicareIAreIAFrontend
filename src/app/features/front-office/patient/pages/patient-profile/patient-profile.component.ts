import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../../services/auth.service';
import { PatientService } from '../../../../../services/patient.service';
import { UserService } from '../../../../../services/user.service';

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.scss']
})
export class PatientProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: any = null;
  isLoading = true;
  showSuccess = false;
  errorMessage: string = '';
  patientId: number | null = null;
  profileImage: string = '';

  defaultMamaAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=512&auto=format&fit=crop';

  get parentRole() {
    return this.authService.getParentRole();
  }

  get userName() {
    const fullName = this.authService.getUserFullName() || 'User';
    return fullName.split(' ')[0];
  }

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private patientService: PatientService,
    private userService: UserService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      birthDate: [''],
      gender: ['MALE'],
      bloodType: ['O_POS'],
      emergencyContactName: [''],
      emergencyContactPhone: [''],
      address: [''],
      relationship: [''],
      notifications: [true],
      marketing: [false]
    });
  }

  ngOnInit(): void {
    // Fill with email from token by default
    const emailFromToken = this.authService.getUserEmail() ?? '';
    this.patientId = this.authService.getUserId();
    
    this.loadUserProfile();
  }

  // Handle profile photo selection
  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  loadUserProfile() {
    this.isLoading = true;
    if (this.patientId) {
      // Retrieve full patient data from backend
      this.patientService.getById(this.patientId).subscribe({
        next: (user: any) => {
          if (user) {
            this.user = user;
            this.profileForm.patchValue({
              fullName: user.fullName || '',
              email: user.email || '',
              phone: user.phone || '',
              birthDate: user.birthDate || '',
              gender: user.gender || 'MALE',
              bloodType: user.bloodType || 'O_POS',
              emergencyContactName: user.emergencyContactName || '',
              emergencyContactPhone: user.emergencyContactPhone || '',
              address: user.address || '',
              relationship: user.relationship || this.parentRole.badge
            });
            this.profileImage = user.profileImage || '';
          }
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Could not load patient profile details', err);
          this.isLoading = false;
        }
      });
    } else {
      // Fallback if no patientId
      this.isLoading = false;
    }
  }

  saveProfile() {
    if (this.profileForm.valid && this.patientId) {
      this.isLoading = true;
      this.errorMessage = '';
      this.showSuccess = false;

      // Prepare payload (merging form values and profile image)
      const payload: any = { 
        ...this.profileForm.getRawValue(),
        profileImage: this.profileImage 
      };

      // Update patient details via PatientService
      this.patientService.update(this.patientId, payload).subscribe({
        next: (response: any) => {
          console.log('Patient profile updated', response);
          this.showSuccess = true;
          this.isLoading = false;
          
          // Clear success toast after 3 seconds
          setTimeout(() => this.showSuccess = false, 3000);

          // If profile image changed, also update global user profile
          if (this.profileImage) {
            this.userService.updateProfile({ 
              fullName: payload.fullName, 
              email: payload.email, 
              profileImage: this.profileImage 
            }).subscribe({
              next: () => console.log('Profile image updated via UserService'),
              error: err => console.error('Error updating profile image via UserService', err)
            });
          }
        },
        error: (error: any) => {
          console.error('Error updating patient profile', error);
          this.errorMessage = 'Update error: ' + (error.error?.message || 'Unknown error');
          this.isLoading = false;
        }
      });
    }
  }
}
