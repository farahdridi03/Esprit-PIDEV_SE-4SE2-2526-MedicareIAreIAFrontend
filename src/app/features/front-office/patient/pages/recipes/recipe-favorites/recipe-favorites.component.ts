import { Component, OnInit } from '@angular/core';
import { NutritionService } from '../../../../../../services/nutrition.service';
import { HealthyRecipe } from '../../../../../../models/nutrition.model';

@Component({
  selector: 'app-recipe-favorites',
  templateUrl: './recipe-favorites.component.html',
  styleUrls: ['./recipe-favorites.component.scss']
})
export class RecipeFavoritesComponent implements OnInit {
  recipes: HealthyRecipe[] = [];
  loading = true;

  constructor(private nutritionService: NutritionService) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    const favoriteIds: number[] = JSON.parse(localStorage.getItem('patient_favorites') || '[]');
    
    if (favoriteIds.length === 0) {
      this.recipes = [];
      this.loading = false;
      return;
    }

    this.nutritionService.getRecipes().subscribe({
      next: (data: HealthyRecipe[]) => {
        this.recipes = data.filter(r => favoriteIds.includes(Number(r.id)));
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading recipes', err);
        this.loading = false;
      }
    });
  }
}
