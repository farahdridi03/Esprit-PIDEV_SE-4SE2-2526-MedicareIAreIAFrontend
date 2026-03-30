import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClinicService } from '../../../../../services/clinic.service';
import { UserService } from '../../../../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clinic-profile-edit',
  templateUrl: './clinic-profile-edit.component.html',
  styleUrls: ['./clinic-profile-edit.component.scss']
})
export class ClinicProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  loading = true;
  saving = false;
  error: string | null = null;
  photoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private clinicService: ClinicService,
    private userService: UserService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone: [''],
      birthDate: [''],
      clinicName: ['', Validators.required],
      address: ['', Validators.required],
      latitude: [null],
      longitude: [null],
      hasEmergency: [false],
      hasAmbulance: [false],
      emergencyPhone: [''],
      ambulancePhone: [''],
      photo: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.clinicService.getMe().subscribe({
      next: (data) => {
        this.profileForm.patchValue({
          ...data
        });
        this.photoPreview = data.photo || null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading clinic profile:', err);
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

    this.clinicService.updateProfile(request).subscribe({
      next: () => {
        this.saving = false;
        this.userService.refreshProfile();
        this.router.navigate(['/front/clinic/profile']);
      },
      error: (err) => {
        console.error('Error updating clinic profile:', err);
        this.saving = false;
        this.error = 'Failed to update profile. Please try again later.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/front/clinic/profile']);
  }
}
