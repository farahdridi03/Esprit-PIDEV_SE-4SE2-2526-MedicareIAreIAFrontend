import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService } from '../../../../../services/patient.service';
import { UserService } from '../../../../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-profile-edit',
  templateUrl: './patient-profile-edit.component.html',
  styleUrls: ['./patient-profile-edit.component.scss']
})
export class PatientProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  loading = true;
  saving = false;
  error: string | null = null;
  photoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private userService: UserService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone: [''],
      birthDate: [''],
      gender: [''],
      bloodType: [''],
      emergencyContactName: [''],
      emergencyContactPhone: [''],
      height: [null, [Validators.min(1)]],
      weight: [null, [Validators.min(1)]],
      allergies: [''],
      diseases: [''],
      photo: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.patientService.getMe().subscribe({
      next: (data) => {
        this.profileForm.patchValue({
          ...data,
          allergies: Array.isArray(data.allergies) ? data.allergies.join(', ') : data.allergies || '',
          diseases: Array.isArray(data.diseases) ? data.diseases.join(', ') : data.diseases || ''
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
    
    // The backend expects comma separated strings for allergies and diseases
    const request = {
      ...formValue,
      height: formValue.height || null,
      weight: formValue.weight || null,
      photo: this.photoPreview
    };

    this.patientService.updateProfile(request).subscribe({
      next: (savedPatient) => {
        this.saving = false;
        // Push the updated photo into the shared profile stream so the topbar
        // reflects the change immediately without requiring a page refresh
        this.userService.setProfile({
          fullName: savedPatient.fullName,
          photo: savedPatient.photo ?? undefined
        });
        this.router.navigate(['/front/patient/profile']);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.saving = false;
        this.error = 'Failed to update profile. Please try again later.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/front/patient/profile']);
  }
}
