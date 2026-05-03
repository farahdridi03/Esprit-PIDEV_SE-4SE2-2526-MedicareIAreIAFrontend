export enum MealType {
    BREAKFAST = 'BREAKFAST',
    LUNCH = 'LUNCH',
    DINNER = 'DINNER',
    SNACK = 'SNACK'
}

export enum DayOfWeek {
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
    SUNDAY = 'SUNDAY'
}

export interface HealthyRecipe {
    id?: number;
    title: string;
    description?: string;
    ingredients: string;
    instructions?: string;
    calories: number;
    prepTimeMinutes?: number;
    category: string;
    imageUrl?: string;
    nutritionistId?: number;
}

export interface MealPlan {
    id?: number;
    lifestylePlanId: number;
    patientId: number;
    dayOfWeek: DayOfWeek;
    mealType: MealType;
    weekNumber?: number;
    notes?: string;
    recipeId: number;
    recipeTitle?: string;
    recipeCalories?: number;
    recipe?: HealthyRecipe;
}

export interface GroceryItem {
    id?: number;
    lifestylePlanId: number;
    patientId?: number;
    itemName: string;
    quantity: string;
    unit: string;
    purchased: boolean;
    createdAt?: string;
}

export interface FoodDiary {
    id?: number;
    patientId: number;
    foodName: string;
    mealType: MealType;
    calories: number;
    date: string;
    imageUrl?: string;
}
export enum AnomalyType {
    OVEREATING = 'OVEREATING',
    UNDEREATING = 'UNDEREATING',
    NO_WEIGHT_PROGRESS = 'NO_WEIGHT_PROGRESS',
    MISSED_LOG = 'MISSED_LOG'
}

export interface DailyHealthReport {
    id: number;
    patientId: number;
    patientName: string;
    lifestylePlanId: number;
    reportDate: string;
    actualCalories: number;
    expectedCalories: number;
    calorieDifference: number;
    currentWeight: number;
    goalWeight: number;
    weightDifference: number;
    missedLog: boolean;
    anomalyDetected: boolean;
    anomalies: AnomalyType[];
    patientPhoto?: string;
}
