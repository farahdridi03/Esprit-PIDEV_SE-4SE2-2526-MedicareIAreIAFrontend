import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../../../../services/patient.service';
import { PatientResponseDTO } from '../../../../../models/patient.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-profile-settings',
  templateUrl: './patient-profile-settings.component.html',
  styleUrls: ['./patient-profile-settings.component.scss']
})
export class PatientProfileSettingsComponent implements OnInit {
  patient: PatientResponseDTO | null = null;
  loading: boolean = true;
  error: string | null = null;
  showPasswordModal: boolean = false;

  constructor(private patientService: PatientService, private router: Router) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.patientService.getMe().subscribe({
      next: (data) => {
        this.patient = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.error = 'Failed to load profile. Please try again later.';
        this.loading = false;
      }
    });
  }

  onUpdate(): void {
    this.router.navigate(['/front/patient/profile/edit']);
  }

  openPasswordModal(): void {
    this.showPasswordModal = true;
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
  }
}
