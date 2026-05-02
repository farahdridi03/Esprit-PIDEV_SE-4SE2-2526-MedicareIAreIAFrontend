import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NutritionService } from '../../../../../services/nutrition.service';
import { LifestyleService } from '../../../../../services/lifestyle.service';
import { AuthService } from '../../../../../services/auth.service';
import { PatientService } from '../../../../../services/patient.service';
import { HealthyRecipe, MealPlan, GroceryItem, FoodDiary, MealType, DayOfWeek } from '../../../../../models/nutrition.model';
import { LifestylePlan } from '../../../../../models/lifestyle.model';
import { PatientResponseDTO } from '../../../../../models/patient.model';

@Component({
  selector: 'app-nutrition-dashboard',
  templateUrl: './nutrition-dashboard.component.html',
  styleUrls: ['./nutrition-dashboard.component.scss']
})
export class NutritionDashboardComponent implements OnInit {
  patientId!: number;
  lifestylePlans: LifestylePlan[] = [];
  selectedPlanId?: number;
  
  patientProfile: PatientResponseDTO | null = null;
  dailyCalorieTarget: number = 2000; // Default fallback
  totalConsumedToday: number = 0;
  selectedImage: string | null = null;
  editingEntryId: number | null = null;
  
  todayMeals: MealPlan[] = [];
  groceryItems: GroceryItem[] = [];
  diaryEntries: FoodDiary[] = [];
  
  today = new Date();
  mealTypes = Object.values(MealType);
  diaryForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private nutritionService: NutritionService,
    private lifestyleService: LifestyleService,
    private authService: AuthService,
    private patientService: PatientService
  ) {
    this.diaryForm = this.fb.group({
      foodName: ['', Validators.required],
      calories: [0, [Validators.required, Validators.min(1)]],
      mealType: [MealType.SNACK, Validators.required]
    });
  }

  ngOnInit(): void {
    const currentUserId = this.authService.getUserId();
    if (currentUserId) {
       this.patientId = currentUserId;
       this.loadPatientProfile();
       this.loadLifestylePlans();
       this.loadFoodDiary();
    }
  }

  loadLifestylePlans(): void {
    this.lifestyleService.getPlansByPatientId(this.patientId).subscribe(plans => {
      this.lifestylePlans = plans;
      if (plans.length > 0) {
        this.selectedPlanId = plans[0].id;
        this.loadData();
      }
    });
  }

  loadData(): void {
    if (!this.selectedPlanId) return;
    this.loadTodayPlan();
    this.loadGroceryItems();
  }

  loadTodayPlan(): void {
    if (!this.selectedPlanId) return;

    this.todayMeals = [];
    const currentDay = this.getCurrentDayOfWeek();
    
    this.nutritionService.getMealPlansByLifestylePlan(this.selectedPlanId).subscribe({
      next: (plans) => {
        // Filter by the current day of the week
        this.todayMeals = plans.filter(m => m.dayOfWeek === currentDay);
        console.log(`Found ${this.todayMeals.length} meals for today (${currentDay})`);
      },
      error: (err) => console.error(`Error loading meals for plan ${this.selectedPlanId}`, err)
    });
  }

  loadGroceryItems(): void {
    if (!this.selectedPlanId) return;
    this.nutritionService.getGroceryItems(this.selectedPlanId).subscribe(items => {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
      const monday = new Date(now.setDate(diff));
      monday.setHours(0, 0, 0, 0);

      this.groceryItems = items.filter(item => {
        if (!item.createdAt) return false;
        const itemDate = new Date(item.createdAt);
        return itemDate >= monday;
      });
    });
  }

  loadFoodDiary(): void {
    const dateStr = this.today.toISOString().split('T')[0];
    this.nutritionService.getFoodDiary(this.patientId, dateStr).subscribe(entries => {
      this.diaryEntries = entries;
      this.calculateConsumption();
    });
  }

  loadPatientProfile(): void {
    this.patientService.getMe().subscribe(profile => {
      this.patientProfile = profile;
      this.calculateDailyTarget();
    });
  }

  calculateDailyTarget(): void {
    if (!this.patientProfile || !this.patientProfile.weight || !this.patientProfile.height) {
      this.dailyCalorieTarget = 2000;
      return;
    }

    const weight = this.patientProfile.weight;
    const height = this.patientProfile.height;
    
    // Calculate age from birthDate
    let age = 30; // Default
    if (this.patientProfile.birthDate) {
      const birthDate = new Date(this.patientProfile.birthDate);
      age = this.today.getFullYear() - birthDate.getFullYear();
      const m = this.today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && this.today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Mifflin-St Jeor Equation
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (this.patientProfile.gender === 'MALE') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // Light activity multiplier
    this.dailyCalorieTarget = Math.round(bmr * 1.2);
  }

  calculateConsumption(): void {
    this.totalConsumedToday = this.diaryEntries.reduce((sum, entry) => sum + entry.calories, 0);
  }

  get remainingCalories(): number {
    return this.dailyCalorieTarget - this.totalConsumedToday;
  }

  isOverLimit(): boolean {
    return this.remainingCalories < 0;
  }

  getTodayMeal(type: MealType): MealPlan | undefined {
    return this.todayMeals.find(m => m.mealType === type);
  }

  toggleGroceryItem(item: GroceryItem): void {
    this.nutritionService.toggleGroceryItemPurchase(item.id!).subscribe({
      next: (updated) => {
        item.purchased = updated.purchased;
      },
      error: (err) => console.error('Error toggling grocery item', err)
    });
  }

  logFood(): void {
    if (this.diaryForm.valid) {
      const entry: FoodDiary = {
        patientId: this.patientId,
        date: this.today.toISOString().split('T')[0],
        imageUrl: this.selectedImage || undefined,
        ...this.diaryForm.value
      };

      if (this.editingEntryId) {
        this.nutritionService.updateFoodDiaryEntry(this.editingEntryId, entry).subscribe({
          next: (updated) => {
            const index = this.diaryEntries.findIndex(e => e.id === this.editingEntryId);
            if (index !== -1) this.diaryEntries[index] = updated;
            this.finalizeForm();
          },
          error: (err) => console.error('Error updating food', err)
        });
      } else {
        this.nutritionService.addFoodDiaryEntry(entry).subscribe({
          next: (saved) => {
            this.diaryEntries.push(saved);
            this.finalizeForm();
          },
          error: (err) => console.error('Error logging food', err)
        });
      }
    }
  }

  private finalizeForm(): void {
    this.calculateConsumption();
    this.diaryForm.reset({ mealType: MealType.SNACK, calories: 0 });
    this.selectedImage = null;
    this.editingEntryId = null;
  }

  editDiaryEntry(entry: FoodDiary): void {
    this.editingEntryId = entry.id || null;
    this.diaryForm.patchValue({
      foodName: entry.foodName,
      calories: entry.calories,
      mealType: entry.mealType
    });
    this.selectedImage = entry.imageUrl || null;
  }

  cancelEdit(): void {
    this.editingEntryId = null;
    this.diaryForm.reset({ mealType: MealType.SNACK, calories: 0 });
    this.selectedImage = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  deleteDiaryEntry(id: number): void {
    this.nutritionService.deleteFoodDiaryEntry(id).subscribe({
      next: () => {
        this.diaryEntries = this.diaryEntries.filter(e => e.id !== id);
        this.calculateConsumption();
      },
      error: (err) => console.error('Error deleting diary entry', err)
    });
  }

  getSelectedPlanTitle(): string {
    const plan = this.lifestylePlans.find(p => p.id === Number(this.selectedPlanId));
    return plan ? plan.title : 'No Plan Selected';
  }

  private getCurrentDayOfWeek(): DayOfWeek {
    const days = [DayOfWeek.SUNDAY, DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY];
    return days[this.today.getDay()];
  }

  getCurrentWeekRange(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const start = new Date(now.setDate(diff));
    const end = new Date(now.setDate(diff + 6)); // Sunday

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  }

  generateWeeklyList(): void {
    if (!this.selectedPlanId) return;
    this.nutritionService.generateGroceryList(this.selectedPlanId, this.patientId).subscribe({
      next: (items) => {
        this.groceryItems = items;
      },
      error: (err) => console.error('Error generating grocery list', err)
    });
  }
}
