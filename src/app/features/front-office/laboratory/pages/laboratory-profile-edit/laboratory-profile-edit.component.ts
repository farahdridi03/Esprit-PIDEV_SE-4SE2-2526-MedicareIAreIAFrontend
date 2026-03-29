import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LaboratoryService } from '../../../../../services/laboratory.service';
import { UserService } from '../../../../../services/user.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-laboratory-profile-edit',
  templateUrl: './laboratory-profile-edit.component.html',
  styleUrls: ['./laboratory-profile-edit.component.scss']
})
export class LaboratoryProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  loading = true;
  saving = false;
  error: string | null = null;
  photoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private laboratoryService: LaboratoryService,
    private userService: UserService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone: [''],
      birthDate: [''],
      photo: [''],
      laboratoryName: ['', Validators.required],
      laboratoryAddress: [''],
      laboratoryPhone: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      profile: this.userService.getProfile(),
      laboratory: this.laboratoryService.getMyLaboratory()
    }).subscribe({
      next: (result) => {
        this.profileForm.patchValue({
          fullName: result.profile.fullName,
          email: result.profile.email,
          phone: result.profile.phone,
          birthDate: result.profile.birthDate,
          photo: result.profile.photo,
          laboratoryName: result.laboratory.name || '',
          laboratoryAddress: result.laboratory.address || '',
          laboratoryPhone: result.laboratory.phone || ''
        });
        this.photoPreview = result.profile.photo || null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading profile data:', err);
        this.error = 'Failed to load profile data. Please try again.';
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

    this.laboratoryService.updateProfile(formValue).subscribe({
      next: () => {
        this.saving = false;
        this.userService.refreshProfile();
        this.router.navigate(['/front/laboratorystaff/profile']);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.saving = false;
        this.error = 'Failed to update profile. Please try again later.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/front/laboratorystaff/profile']);
  }
}
