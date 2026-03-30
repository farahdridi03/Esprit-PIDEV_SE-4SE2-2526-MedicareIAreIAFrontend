import { Component, OnInit } from '@angular/core';
import { NutritionistService } from '../../../../../services/nutritionist.service';
import { NutritionistResponseDTO } from '../../../../../models/nutritionist.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nutritionist-profile-settings',
  templateUrl: './nutritionist-profile-settings.component.html',
  styleUrls: ['./nutritionist-profile-settings.component.scss']
})
export class NutritionistProfileSettingsComponent implements OnInit {
  nutritionist: NutritionistResponseDTO | null = null;
  loading: boolean = true;
  error: string | null = null;
  showPasswordModal: boolean = false;

  constructor(private nutritionistService: NutritionistService, private router: Router) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.nutritionistService.getMe().subscribe({
      next: (data: any) => {
        this.nutritionist = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading profile:', err);
        this.error = 'Failed to load profile. Please try again later.';
        this.loading = false;
      }
    });
  }

  onUpdate(): void {
    this.router.navigate(['/front/nutritionist/profile/edit']);
  }

  openPasswordModal(): void {
    this.showPasswordModal = true;
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
  }
}
