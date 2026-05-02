import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NutritionService } from '../../../../../services/nutrition.service';
import { HealthyRecipe } from '../../../../../models/nutrition.model';
import { AuthService } from '../../../../../services/auth.service';

@Component({
    selector: 'app-recipe-management',
    templateUrl: './recipe-management.component.html',
    styleUrls: ['./recipe-management.component.scss']
})
export class RecipeManagementComponent implements OnInit {
    recipes: HealthyRecipe[] = [];
    recipeForm: FormGroup;
    showForm = false;
    isEditing = false;
    currentRecipeId?: number;

    constructor(
        private fb: FormBuilder,
        private nutritionService: NutritionService,
        private authService: AuthService
    ) {
        this.recipeForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', Validators.required],
            category: ['Protein', Validators.required],
            calories: [0, [Validators.required, Validators.min(0)]],
            prepTimeMinutes: [0, [Validators.required, Validators.min(0)]],
            ingredients: ['', Validators.required],
            instructions: ['', Validators.required],
            imageUrl: ['']
        });
    }

    ngOnInit(): void {
        this.loadRecipes();
    }

    loadRecipes(): void {
        this.nutritionService.getRecipes().subscribe({
            next: (data) => {
                this.recipes = data;
            },
            error: (err) => console.error('Error loading recipes', err)
        });
    }

    toggleForm(): void {
        this.showForm = !this.showForm;
        if (!this.showForm) {
            this.resetForm();
        }
    }

    saveRecipe(): void {
        if (this.recipeForm.valid) {
            const recipe: HealthyRecipe = this.recipeForm.value;
            const nutritionistId = this.authService.getUserId();
            
            if (!nutritionistId) {
                console.error('No nutritionist ID found. User might not be logged in or missing ID claim.');
                alert('Authentication error: Nutritionist ID not found.');
                return;
            }
            
            recipe.nutritionistId = nutritionistId;

            if (this.isEditing && this.currentRecipeId) {
                this.nutritionService.updateRecipe(this.currentRecipeId, recipe).subscribe({
                    next: () => {
                        this.loadRecipes();
                        this.toggleForm();
                    },
                    error: (err) => console.error('Error updating recipe', err)
                });
            } else {
                this.nutritionService.addRecipe(recipe).subscribe({
                    next: () => {
                        this.loadRecipes();
                        this.toggleForm();
                    },
                    error: (err) => console.error('Error adding recipe', err)
                });
            }
        }
    }

    editRecipe(recipe: HealthyRecipe): void {
        this.isEditing = true;
        this.currentRecipeId = recipe.id;
        this.recipeForm.patchValue({
            ...recipe,
            prepTimeMinutes: recipe.prepTimeMinutes || 0,
            calories: recipe.calories || 0
        });
        this.showForm = true;
    }

    deleteRecipe(id: number): void {
        if (confirm('Are you sure you want to delete this recipe?')) {
            this.nutritionService.deleteRecipe(id).subscribe({
                next: () => this.loadRecipes(),
                error: (err) => console.error('Error deleting recipe', err)
            });
        }
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Image is too large. Maximum size is 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.recipeForm.patchValue({
                    imageUrl: e.target.result
                });
            };
            reader.readAsDataURL(file);
        }
    }

    resetForm(): void {
        this.recipeForm.reset({
            category: 'Protein',
            calories: 0,
            prepTimeMinutes: 0,
            imageUrl: ''
        });
        this.isEditing = false;
        this.currentRecipeId = undefined;
    }
}
