import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Pages
import { NutritionistDashboardComponent } from './pages/nutritionist-dashboard/nutritionist-dashboard.component';
import { NutritionistPatientsComponent } from './pages/nutritionist-patients/nutritionist-patients.component';
import { NutritionistPatientDetailComponent } from './pages/nutritionist-patient-detail/nutritionist-patient-detail.component';
import { NutritionistPredictionComponent } from './pages/nutritionist-prediction/nutritionist-prediction.component';
import { NutritionistProfileEditComponent } from './pages/nutritionist-profile-edit/nutritionist-profile-edit.component';
import { NutritionistProfileSettingsComponent } from './pages/nutritionist-profile-settings/nutritionist-profile-settings.component';
import { RecipeManagementComponent } from './pages/recipe-management/recipe-management.component';
import { NutritionistFoodDiaryListComponent } from './pages/nutritionist-food-diary-list/nutritionist-food-diary-list.component';
import { NutritionistLifestyleFormComponent } from './pages/nutritionist-lifestyle-form/nutritionist-lifestyle-form.component';
import { NutritionistLifestyleListComponent } from './pages/nutritionist-lifestyle-list/nutritionist-lifestyle-list.component';
import { MealPlanBuilderComponent } from './pages/meal-plan-builder/meal-plan-builder.component';

const routes: Routes = [
    { path: 'dashboard', component: NutritionistDashboardComponent },
    { path: 'patients', component: NutritionistPatientsComponent },
    { path: 'patient/:id', component: NutritionistPatientDetailComponent },
    { path: 'patient/:id/food-diary', component: NutritionistFoodDiaryListComponent },
    { path: 'lifestyle/plans', component: NutritionistLifestyleListComponent },
    { path: 'lifestyle/plans/new', component: NutritionistLifestyleFormComponent },
    { path: 'lifestyle/plans/edit/:id', component: NutritionistLifestyleFormComponent },
    { path: 'lifestyle/goals', component: NutritionistLifestyleListComponent },
    { path: 'lifestyle/tracking', component: NutritionistLifestyleListComponent },
    { path: 'recipes', component: RecipeManagementComponent },
    { path: 'prediction', component: NutritionistPredictionComponent },
    { path: 'profile/edit', component: NutritionistProfileEditComponent },
    { path: 'profile/settings', component: NutritionistProfileSettingsComponent },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

import { NutritionistSidebarComponent } from './components/nutritionist-sidebar/nutritionist-sidebar.component';
import { NutritionistTopbarComponent } from './components/nutritionist-topbar/nutritionist-topbar.component';
import { PasswordModalComponent } from '../patient/components/password-modal/password-modal.component';

@NgModule({
    declarations: [
        NutritionistDashboardComponent,
        NutritionistPatientsComponent,
        NutritionistPatientDetailComponent,
        NutritionistPredictionComponent,
        NutritionistProfileEditComponent,
        NutritionistProfileSettingsComponent,
        RecipeManagementComponent,
        NutritionistFoodDiaryListComponent,
        NutritionistLifestyleFormComponent,
        NutritionistLifestyleListComponent,
        MealPlanBuilderComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        NutritionistSidebarComponent,
        NutritionistTopbarComponent,
        PasswordModalComponent
    ]
})
export class NutritionistModule { }
