import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NutritionService } from '../../../../../services/nutrition.service';
import { FoodDiary } from '../../../../../models/nutrition.model';

@Component({
  selector: 'app-nutritionist-food-diary-list',
  templateUrl: './nutritionist-food-diary-list.component.html',
  styleUrls: ['./nutritionist-food-diary-list.component.scss']
})
export class NutritionistFoodDiaryListComponent implements OnInit {
  patientId: number | null = null;
  foodDiaryEntries: FoodDiary[] = [];
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private nutritionService: NutritionService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = +params['id'];
      if (this.patientId) {
        this.loadFoodDiary(this.patientId);
      }
    });
  }

  loadFoodDiary(id: number): void {
    this.isLoading = true;
    this.nutritionService.getFoodDiariesByPatient(id).subscribe({
      next: (data) => {
        this.foodDiaryEntries = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching food diary:', err);
        this.isLoading = false;
      }
    });
  }

  getBackLink(): string {
    return `/front/nutritionist/patient/${this.patientId}`;
  }
}
