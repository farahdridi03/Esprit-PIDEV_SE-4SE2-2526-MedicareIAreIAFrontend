import { Component, OnInit } from '@angular/core';
import { NutritionService } from '../../../../../../services/nutrition.service';
import { HealthyRecipe } from '../../../../../../models/nutrition.model';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit {
  recipes: HealthyRecipe[] = [];
  loading = true;

  constructor(private nutritionService: NutritionService) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.nutritionService.getRecipes().subscribe({
      next: (data: HealthyRecipe[]) => {
        this.recipes = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading recipes', err);
        this.loading = false;
      }
    });
  }
}
