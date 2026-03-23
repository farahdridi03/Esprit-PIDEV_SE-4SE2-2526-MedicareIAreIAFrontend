import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { DoctorService, DoctorProfile } from '../../../../../services/doctor.service';
import { ClinicService, Clinic } from '../../../../../services/clinic.service';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css']
})
export class DoctorProfileComponent implements OnInit {
  // Basic Info
  userId: number = 0;
  fullName: string = '';
  email: string = '';
  password?: string = '';

  // Professional Info
  specialty: string = '';
  consultationMode: 'ONLINE' | 'IN_PERSON' | 'BOTH' = 'IN_PERSON';
  consultationFee: number = 0;
  licenseNumber: string = '';
  yearsOfExperience: number = 0;
  clinicId: number | null = null;
  currentClinicName: string = '';
  currentClinicAddress: string = '';
  profilePicture: string | null = null;

  // Data
  clinics: Clinic[] = [];

  // Messages
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private doctorService: DoctorService,
    private clinicService: ClinicService
  ) { }

  ngOnInit() {
    this.userId = this.authService.getUserId();
    this.loadProfile();
    this.loadClinics();
  }

  loadProfile() {
    this.isLoading = true;
    this.doctorService.getProfile(this.userId).subscribe({
      next: (profile: DoctorProfile) => {
        this.fullName = profile.fullName;
        this.email = profile.email;
        this.specialty = profile.specialty || '';
        this.consultationMode = profile.consultationMode || 'IN_PERSON';
        this.consultationFee = profile.consultationFee || 0;
        this.licenseNumber = profile.licenseNumber || '';
        this.yearsOfExperience = profile.yearsOfExperience || 0;
        this.clinicId = profile.clinicId || null;
        this.currentClinicName = profile.clinicName || '';
        this.currentClinicAddress = profile.clinicAddress || '';
        this.profilePicture = profile.profilePicture || null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading doctor profile', err);
        this.errorMessage = 'Impossible de charger les données du profil.';
        this.isLoading = false;
      }
    });
  }

  loadClinics() {
    this.clinicService.getAllClinics().subscribe(data => {
      this.clinics = data.filter(c => c.verified);
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            this.profilePicture = canvas.toDataURL('image/jpeg', 0.8);
          } else {
            this.profilePicture = e.target.result; // Fallback
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    // 1. Prepare User Info Update
    const userRequest: any = {
      fullName: this.fullName,
      email: this.email
    };
    if (this.password && this.password.trim() !== '') {
      userRequest.password = this.password;
    }

    // 2. Prepare Doctor Info Update
    const doctorRequest: any = {
      specialty: this.specialty,
      consultationMode: this.consultationMode,
      consultationFee: this.consultationFee,
      licenseNumber: this.licenseNumber,
      yearsOfExperience: this.yearsOfExperience,
      clinicId: this.consultationMode === 'ONLINE' ? null : this.clinicId,
      profilePicture: this.profilePicture
    };

    // 3. Sequential updates to avoid DB record version conflicts (inheritance JOINED)
    this.userService.updateProfile({ ...userRequest, role: 'DOCTOR' }).pipe(
      switchMap(() => this.doctorService.updateProfile(this.userId, doctorRequest))
    ).subscribe({
      next: (results) => {
        console.log('Update results', results);
        this.successMessage = 'Profil mis à jour avec succès.';
        this.isLoading = false;
        this.password = ''; // Clear password field after success
        // Reload to get fresh clinic info / address
        this.loadProfile();
      },
      error: (error: any) => {
        console.error('Error updating profiles', error);
        this.errorMessage = 'Une erreur est survenue lors de la mise à jour.';
        this.isLoading = false;
      }
    });
  }
}
