import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NutritionService } from '../../../../../../services/nutrition.service';
import { HealthyRecipe } from '../../../../../../models/nutrition.model';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss']
})
export class RecipeDetailComponent implements OnInit {
  recipe?: HealthyRecipe;
  loading = true;
  isFavorite = false;

  constructor(
    private route: ActivatedRoute,
    private nutritionService: NutritionService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadRecipe(id);
      this.checkFavorite(id);
    }
  }

  checkFavorite(id: number): void {
    const favorites = JSON.parse(localStorage.getItem('patient_favorites') || '[]');
    this.isFavorite = favorites.includes(Number(id));
  }

  toggleFavorite(): void {
    if (!this.recipe?.id) return;
    
    const favorites = JSON.parse(localStorage.getItem('patient_favorites') || '[]');
    const recipeId = Number(this.recipe.id);
    
    if (this.isFavorite) {
      const index = favorites.indexOf(recipeId);
      if (index > -1) favorites.splice(index, 1);
    } else {
      favorites.push(recipeId);
    }
    
    localStorage.setItem('patient_favorites', JSON.stringify(favorites));
    this.isFavorite = !this.isFavorite;
  }

  loadRecipe(id: number): void {
    this.nutritionService.getRecipeById(id).subscribe({
      next: (data: HealthyRecipe) => {
        this.recipe = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading recipe details', err);
        this.loading = false;
      }
    });
  }

  get ingredientsArray(): string[] {
    return this.recipe?.ingredients ? this.recipe.ingredients.split(',').map((i: string) => i.trim()) : [];
  }

  get instructionsArray(): string[] {
    return this.recipe?.instructions ? this.recipe.instructions.split('\n').filter((i: string) => i.trim() !== '') : [];
  }
}
