import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HealthyRecipe, MealPlan, GroceryItem, FoodDiary, DailyHealthReport } from '../models/nutrition.model';

@Injectable({
    providedIn: 'root'
})
export class NutritionService {
    private readonly baseUrl = 'http://localhost:8081/springsecurity/api';

    constructor(private http: HttpClient) { }

    // Healthy Recipes
    getRecipes(): Observable<HealthyRecipe[]> {
        return this.http.get<HealthyRecipe[]>(`${this.baseUrl}/healthy-recipes`);
    }

    getRecipeById(id: number): Observable<HealthyRecipe> {
        return this.http.get<HealthyRecipe>(`${this.baseUrl}/healthy-recipes/${id}`);
    }

    addRecipe(recipe: HealthyRecipe): Observable<HealthyRecipe> {
        return this.http.post<HealthyRecipe>(`${this.baseUrl}/healthy-recipes`, recipe);
    }

    updateRecipe(id: number, recipe: HealthyRecipe): Observable<HealthyRecipe> {
        return this.http.put<HealthyRecipe>(`${this.baseUrl}/healthy-recipes/${id}`, recipe);
    }

    deleteRecipe(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/healthy-recipes/${id}`);
    }

    // Meal Plans
    getMealPlansByLifestylePlan(lifestylePlanId: number): Observable<MealPlan[]> {
        return this.http.get<MealPlan[]>(`${this.baseUrl}/meal-plans/lifestyle-plan/${lifestylePlanId}`);
    }

    addMealPlan(mealPlan: MealPlan): Observable<MealPlan> {
        return this.http.post<MealPlan>(`${this.baseUrl}/meal-plans`, mealPlan);
    }

    deleteMealPlan(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/meal-plans/${id}`);
    }

    saveAllMealPlans(lifestylePlanId: number, plans: MealPlan[]): Observable<MealPlan[]> {
        return this.http.post<MealPlan[]>(`${this.baseUrl}/meal-plans/bulk/${lifestylePlanId}`, plans);
    }

    // Grocery Items
    getGroceryItems(lifestylePlanId: number): Observable<GroceryItem[]> {
        return this.http.get<GroceryItem[]>(`${this.baseUrl}/grocery-lists/lifestyle-plan/${lifestylePlanId}`);
    }

    generateGroceryList(lifestylePlanId: number, patientId: number): Observable<GroceryItem[]> {
        return this.http.post<GroceryItem[]>(
            `${this.baseUrl}/grocery-lists/generate?lifestylePlanId=${lifestylePlanId}&patientId=${patientId}`, 
            {}
        );
    }

    toggleGroceryItemPurchase(id: number): Observable<GroceryItem> {
        return this.http.put<GroceryItem>(`${this.baseUrl}/grocery-lists/${id}/purchase`, {});
    }

    // Food Diary
    getFoodDiary(patientId: number, date: string): Observable<FoodDiary[]> {
        return this.http.get<FoodDiary[]>(`${this.baseUrl}/food-diaries/patient/${patientId}/date/${date}`);
    }

    getFoodDiariesByPatient(patientId: number): Observable<FoodDiary[]> {
        return this.http.get<FoodDiary[]>(`${this.baseUrl}/food-diaries/patient/${patientId}`);
    }

    addFoodDiaryEntry(entry: FoodDiary): Observable<FoodDiary> {
        return this.http.post<FoodDiary>(`${this.baseUrl}/food-diaries`, entry);
    }

    updateFoodDiaryEntry(id: number, entry: FoodDiary): Observable<FoodDiary> {
        return this.http.put<FoodDiary>(`${this.baseUrl}/food-diaries/${id}`, entry);
    }

    deleteFoodDiaryEntry(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/food-diaries/${id}`);
    }

    // Daily Health Reports
    getDailyHealthReport(patientId: number, date: string): Observable<DailyHealthReport> {
        return this.http.get<DailyHealthReport>(`${this.baseUrl}/health-reports/patient/${patientId}/date/${date}`);
    }

    getHealthReportRange(patientId: number, from: string, to: string): Observable<DailyHealthReport[]> {
        return this.http.get<DailyHealthReport[]>(`${this.baseUrl}/health-reports/patient/${patientId}/range?from=${from}&to=${to}`);
    }

    getLatestHealthSummary(): Observable<DailyHealthReport[]> {
        return this.http.get<DailyHealthReport[]>(`${this.baseUrl}/health-reports/latest-summary`);
    }

    generateDailyReport(patientId: number, date: string): Observable<DailyHealthReport> {
        return this.http.post<DailyHealthReport>(`${this.baseUrl}/health-reports/patient/${patientId}/generate?date=${date}`, {});
    }
}
