import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { UserResponseDTO } from '../../../../../models/user.model';
import { LaboratoryService } from '../../../../../services/laboratory.service';
import { LaboratoryResponseDTO } from '../../../../../models/laboratory.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-laboratory-profile-settings',
  templateUrl: './laboratory-profile-settings.component.html',
  styleUrls: ['./laboratory-profile-settings.component.scss']
})
export class LaboratoryStaffProfileSettingsComponent implements OnInit {
  user: UserResponseDTO | null = null;
  laboratory: LaboratoryResponseDTO | null = null;
  loading: boolean = true;
  error: string | null = null;
  showPasswordModal: boolean = false;

  constructor(
    private userService: UserService,
    private laboratoryService: LaboratoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadLaboratory();
  }

  loadProfile(): void {
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.error = 'Failed to load profile. Please try again later.';
        this.loading = false;
      }
    });
  }

  loadLaboratory(): void {
    this.laboratoryService.getMyLaboratory().subscribe({
      next: (data) => {
        this.laboratory = data;
      },
      error: (err) => {
        console.error('Error loading laboratory info:', err);
        // We might not want to set loading = false or show an error for the whole page 
        // if just the lab info fails, but for now we'll just log it.
      }
    });
  }

  onUpdate(): void {
    // Navigate to edit profile page (to be implemented if needed)
    this.router.navigate(['/front/laboratorystaff/profile/edit']);
  }

  openPasswordModal(): void {
    this.showPasswordModal = true;
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
  }
}
