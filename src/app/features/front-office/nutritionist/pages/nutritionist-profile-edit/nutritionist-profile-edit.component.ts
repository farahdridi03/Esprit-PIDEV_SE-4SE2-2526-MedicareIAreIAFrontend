import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NutritionistService } from '../../../../../services/nutritionist.service';
import { UserService } from '../../../../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nutritionist-profile-edit',
  templateUrl: './nutritionist-profile-edit.component.html',
  styleUrls: ['./nutritionist-profile-edit.component.scss']
})
export class NutritionistProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  loading = true;
  saving = false;
  error: string | null = null;
  photoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private nutritionistService: NutritionistService,
    private userService: UserService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: [''],
      birthDate: [''],
      licenseNumber: [{ value: '', disabled: true }],
      specialties: [''],
      consultationFee: [null, [Validators.min(0)]],
      consultationMode: [''],
      photo: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.nutritionistService.getMe().subscribe({
      next: (data) => {
        this.profileForm.patchValue({
          ...data
        });
        this.photoPreview = data.photo || null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.error = 'Failed to load profile. Please try again.';
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('Image size should be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result as string;
        this.profileForm.patchValue({ photo: this.photoPreview });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.saving = true;
    this.error = null;
    const formValue = this.profileForm.getRawValue();
    
    const request = {
      ...formValue,
      photo: this.photoPreview
    };

    this.nutritionistService.updateProfile(request).subscribe({
      next: () => {
        this.saving = false;
        this.userService.refreshProfile(); // Refresh global profile state
        // Navigate back to dashboard or stay on profile? Let's stay for now or navigate to dashboard
        this.router.navigate(['/front/nutritionist/dashboard']);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.saving = false;
        this.error = 'Failed to update profile. Please try again later.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/front/nutritionist/dashboard']);
  }
}
