import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Components
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DonationsComponent } from './pages/donations/donations.component';
import { EmergencyComponent } from './pages/emergency/emergency.component';
import { PatientProfileComponent } from './pages/patient-profile/patient-profile.component';
import { PatientDoctorsListComponent } from './pages/patient-doctors-list/patient-doctors-list.component';
import { PatientDoctorDetailComponent } from './pages/patient-doctor-detail/patient-doctor-detail.component';
import { PatientAppointmentsComponent } from './pages/patient-appointments/patient-appointments.component';
import { PatientBabyCareComponent } from './pages/patient-baby-care/patient-baby-care.component';
import { MedicalRecordComponent } from './pages/medical-record/medical-record.component';
import { PatientRecordListComponent } from './pages/patient-record-list/patient-record-list.component';
import { LifestyleWellnessComponent } from './pages/lifestyle-wellness/lifestyle-wellness.component';
import { LifestyleListComponent } from './pages/lifestyle-list/lifestyle-list.component';
import { LifestyleFormComponent } from './pages/lifestyle-form/lifestyle-form.component';
import { PatientProfileSettingsComponent } from './pages/patient-profile-settings/patient-profile-settings.component';
import { PatientProfileEditComponent } from './pages/patient-profile-edit/patient-profile-edit.component';
import { PatientLabRequestsComponent } from './pages/lab-requests/lab-requests.component';
import { PatientLabRequestFormComponent } from './pages/lab-requests/lab-request-form/lab-request-form.component';
import { PharmacyComponent } from './pages/pharmacy/pharmacy.component';
import { PharmacyOrderCreateComponent } from './pages/pharmacy-order-create/pharmacy-order-create.component';
import { PharmacyOrderListComponent } from './pages/pharmacy-order-list/pharmacy-order-list.component';
import { PharmacyOrderDetailComponent } from './pages/pharmacy-order-detail/pharmacy-order-detail.component';
import { HomecareCatalogComponent } from './pages/homecare-catalog/homecare-catalog.component';
import { HomecareRequestListComponent } from './pages/homecare-request-list/homecare-request-list.component';
import { HomecareBookComponent } from './pages/homecare-book/homecare-book.component';
import { HomecareReviewComponent } from './pages/homecare-review/homecare-review.component';
import { NutritionDashboardComponent } from './pages/nutrition-dashboard/nutrition-dashboard.component';
import { NutritionDailyReportComponent } from './pages/nutrition-daily-report/nutrition-daily-report.component';
import { PatientPrescriptionDetailComponent } from './pages/patient-prescription-detail/patient-prescription-detail.component';
import { RecipeListComponent } from './pages/recipes/recipe-list/recipe-list.component';
import { RecipeDetailComponent } from './pages/recipes/recipe-detail/recipe-detail.component';
import { RecipeFavoritesComponent } from './pages/recipes/recipe-favorites/recipe-favorites.component';

// Shared
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { PasswordModalComponent } from './components/password-modal/password-modal.component';
import { LifestyleSharedModule } from './lifestyle-shared.module';

@NgModule({
  declarations: [
    DashboardComponent,
    DonationsComponent,
    EmergencyComponent,
    PatientProfileComponent,
    PatientDoctorsListComponent,
    PatientDoctorDetailComponent,
    PatientAppointmentsComponent,
    PatientBabyCareComponent,
    MedicalRecordComponent,
    PatientRecordListComponent,
    LifestyleWellnessComponent,
    LifestyleListComponent,
    LifestyleFormComponent,
    PatientProfileSettingsComponent,
    PatientProfileEditComponent,
    PatientLabRequestsComponent,
    PatientLabRequestFormComponent,
    PharmacyComponent,
    PharmacyOrderCreateComponent,
    PharmacyOrderListComponent,
    PharmacyOrderDetailComponent,
    HomecareCatalogComponent,
    HomecareRequestListComponent,
    HomecareBookComponent,
    HomecareReviewComponent,
    NutritionDashboardComponent,
    NutritionDailyReportComponent,
    PatientPrescriptionDetailComponent,
    RecipeListComponent,
    RecipeDetailComponent,
    RecipeFavoritesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SidebarComponent,
    TopbarComponent,
    PasswordModalComponent,
    LifestyleSharedModule
  ],
  exports: [
    DashboardComponent,
    DonationsComponent,
    EmergencyComponent,
    PatientProfileComponent,
    PatientDoctorsListComponent,
    PatientDoctorDetailComponent,
    PatientAppointmentsComponent,
    PatientBabyCareComponent,
    MedicalRecordComponent,
    PatientRecordListComponent,
    LifestyleWellnessComponent,
    LifestyleListComponent,
    LifestyleFormComponent,
    PatientProfileSettingsComponent,
    PatientProfileEditComponent,
    PatientLabRequestsComponent,
    PatientLabRequestFormComponent,
    PharmacyComponent,
    PharmacyOrderCreateComponent,
    PharmacyOrderListComponent,
    PharmacyOrderDetailComponent,
    HomecareCatalogComponent,
    HomecareRequestListComponent,
    HomecareBookComponent,
    HomecareReviewComponent,
    NutritionDashboardComponent,
    NutritionDailyReportComponent,
    PatientPrescriptionDetailComponent,
    RecipeListComponent,
    RecipeDetailComponent,
    RecipeFavoritesComponent
  ]
})
export class PatientModule { }
