import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';
import { DoctorService } from '../../../../../services/doctor.service';
import { UserService } from '../../../../../services/user.service';

@Component({
  selector: 'app-doctor-profile-edit',
  templateUrl: './doctor-profile-edit.component.html',
  styleUrls: ['./doctor-profile-edit.component.scss']
})
export class DoctorProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  loading = true;
  saving = false;
  error: string | null = null;
  photoPreview: string | null = null;
  private doctorId!: number;

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      licenseNumber: [''],
      specialty: [''],
      yearsOfExperience: [null, [Validators.min(0)]],
      consultationFee: [null, [Validators.min(0)]],
      consultationMode: [''],
      bio: ['']
    });
  }

  ngOnInit(): void {
    this.doctorId = this.authService.getUserId()!;
    if (this.doctorId) {
      this.doctorService.getProfile(this.doctorId).subscribe({
        next: (data) => {
          this.profileForm.patchValue(data);
          this.photoPreview = data.profilePicture || null;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load profile. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;
    this.saving = true;
    this.error = null;

    const formValue = this.profileForm.getRawValue();
    const request = { ...formValue, profilePicture: this.photoPreview };

    this.doctorService.updateProfile(this.doctorId, request).subscribe({
      next: (saved) => {
        this.saving = false;
        this.userService.setProfile({
          fullName: saved.fullName,
          photo: saved.profilePicture ?? undefined
        });
        this.router.navigate(['/front/doctor/profile']);
      },
      error: () => {
        this.saving = false;
        this.error = 'Failed to update profile. Please try again.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/front/doctor/profile']);
  }
}
