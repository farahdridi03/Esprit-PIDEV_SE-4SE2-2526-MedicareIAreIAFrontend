import { Component, OnInit } from '@angular/core';
import { ClinicService } from '../../../../../services/clinic.service';
import { ClinicResponseDTO } from '../../../../../models/clinic.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clinic-profile-settings',
  templateUrl: './clinic-profile-settings.component.html',
  styleUrls: ['./clinic-profile-settings.component.scss']
})
export class ClinicProfileSettingsComponent implements OnInit {
  clinic: ClinicResponseDTO | null = null;
  loading: boolean = true;
  error: string | null = null;
  showPasswordModal: boolean = false;

  constructor(private clinicService: ClinicService, private router: Router) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.clinicService.getMe().subscribe({
      next: (data) => {
        this.clinic = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading clinic profile:', err);
        this.error = 'Failed to load profile. Please try again later.';
        this.loading = false;
      }
    });
  }

  onUpdate(): void {
    this.router.navigate(['/front/clinic/profile/edit']);
  }

  openPasswordModal(): void {
    this.showPasswordModal = true;
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
  }
}
