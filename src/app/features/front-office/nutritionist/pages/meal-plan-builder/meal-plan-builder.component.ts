import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NutritionService } from '../../../../../services/nutrition.service';
import { LifestyleService } from '../../../../../services/lifestyle.service';
import { HealthyRecipe, MealPlan, DayOfWeek, MealType } from '../../../../../models/nutrition.model';

@Component({
    selector: 'app-meal-plan-builder',
    templateUrl: './meal-plan-builder.component.html',
    styleUrls: ['./meal-plan-builder.component.scss']
})
export class MealPlanBuilderComponent implements OnInit {
    lifestylePlanId!: number;
    patientId!: number;
    planTitle: string = 'Loading...';
    lifestylePlan?: any;
    mealPlans: MealPlan[] = [];
    allRecipes: HealthyRecipe[] = [];
    filteredRecipes: HealthyRecipe[] = [];
    
    days = Object.values(DayOfWeek);
    mealTypes = Object.values(MealType);
    weeks = [1, 2, 3, 4];
    selectedWeek = 1;
    
    showPicker = false;
    selectedDay?: DayOfWeek;
    selectedType?: MealType;
    searchText = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private nutritionService: NutritionService,
        private lifestyleService: LifestyleService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.lifestylePlanId = +params['planId'];
            this.patientId = +params['id'];
            this.loadInitialData();
        });
    }

    loadInitialData(): void {
        // Load Plan Title
        this.lifestyleService.getPlanById(this.lifestylePlanId).subscribe(plan => {
            this.lifestylePlan = plan;
            this.planTitle = plan.title;
        });

        // Load Meal Plans
        this.nutritionService.getMealPlansByLifestylePlan(this.lifestylePlanId).subscribe(plans => {
            this.mealPlans = plans;
        });

        // Load All Recipes
        this.nutritionService.getRecipes().subscribe(recipes => {
            this.allRecipes = recipes;
            this.filteredRecipes = recipes;
        });
    }

    changeWeek(week: number): void {
        this.selectedWeek = week;
    }

    getWeekRange(weekNum: number): string {
        if (!this.lifestylePlan || !this.lifestylePlan.startDate) return `Week ${weekNum}`;
        
        const start = new Date(this.lifestylePlan.startDate);
        const weekStart = new Date(start);
        weekStart.setDate(start.getDate() + (weekNum - 1) * 7);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `${weekStart.toLocaleDateString('en-US', options)} - ${weekEnd.toLocaleDateString('en-US', options)}`;
    }

    getDayDate(day: string): string {
        if (!this.lifestylePlan || !this.lifestylePlan.startDate) return '';
        
        const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
        const dayIndex = daysOrder.indexOf(day);
        
        const start = new Date(this.lifestylePlan.startDate);
        const dayDate = new Date(start);
        dayDate.setDate(start.getDate() + (this.selectedWeek - 1) * 7 + dayIndex);
        
        return dayDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }

    getAssignedRecipe(day: DayOfWeek, type: MealType): MealPlan | undefined {
        return this.mealPlans.find(m => m.dayOfWeek === day && m.mealType === type && (m.weekNumber === this.selectedWeek || (!m.weekNumber && this.selectedWeek === 1)));
    }

    openRecipePicker(day: DayOfWeek, type: MealType): void {
        this.selectedDay = day;
        this.selectedType = type;
        this.showPicker = true;
        this.searchText = '';
        this.filteredRecipes = this.allRecipes;
    }

    closePicker(): void {
        this.showPicker = false;
    }

    selectRecipe(recipe: HealthyRecipe): void {
        if (!this.selectedDay || !this.selectedType) return;

        const newMeal: MealPlan = {
            lifestylePlanId: this.lifestylePlanId,
            patientId: this.patientId,
            recipeId: recipe.id!,
            dayOfWeek: this.selectedDay,
            mealType: this.selectedType,
            weekNumber: this.selectedWeek,
            recipe: recipe // Attach for local display
        };

        // Remove any existing meal in this slot
        this.mealPlans = this.mealPlans.filter(m => 
            !(m.dayOfWeek === newMeal.dayOfWeek && 
              m.mealType === newMeal.mealType && 
              m.weekNumber === newMeal.weekNumber)
        );

        this.mealPlans.push(newMeal);
        this.closePicker();
    }

    removeMeal(meal: MealPlan): void {
        this.mealPlans = this.mealPlans.filter(m => m !== meal);
    }

    savePlan(): void {
        const cleanPlans = this.mealPlans.map(m => ({
            lifestylePlanId: this.lifestylePlanId,
            patientId: this.patientId,
            recipeId: m.recipeId,
            dayOfWeek: m.dayOfWeek,
            mealType: m.mealType,
            weekNumber: m.weekNumber || 1,
            notes: m.notes
        }));

        this.nutritionService.saveAllMealPlans(this.lifestylePlanId, cleanPlans as any).subscribe({
            next: (savedPlans) => {
                this.mealPlans = savedPlans;
                alert('Meal plan saved successfully!');
                this.goBack();
            },
            error: (err) => {
                console.error('Error saving meal plan', err);
                alert('Failed to save meal plan. The server encountered an error. Please ensure all meals are correctly assigned.');
            }
        });
    }

    generateGroceryList(): void {
        this.nutritionService.generateGroceryList(this.lifestylePlanId, this.patientId).subscribe({
            next: () => {
                alert('Grocery list auto-generated successfully based on recipes in this plan!');
            },
            error: (err) => console.error('Error generating grocery list', err)
        });
    }

    goBack(): void {
        window.history.back();
    }

    filterRecipes(): void {
        this.filteredRecipes = this.allRecipes.filter(r => 
            r.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
            r.category.toLowerCase().includes(this.searchText.toLowerCase())
        );
    }
}
