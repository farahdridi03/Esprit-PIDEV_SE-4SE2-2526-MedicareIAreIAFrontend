import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Patient Components
import { PatientSidebarComponent } from '../patient/components/sidebar/sidebar.component';
import { TopbarComponent } from '../patient/components/topbar/topbar.component';

// Nutritionist Components
import { NutritionistSidebarComponent } from '../nutritionist/components/nutritionist-sidebar/nutritionist-sidebar.component';
import { NutritionistTopbarComponent } from '../nutritionist/components/nutritionist-topbar/nutritionist-topbar.component';

// Doctor Components
import { DoctorSidebarComponent } from '../doctor/components/doctor-sidebar/doctor-sidebar.component';
import { DoctorTopbarComponent } from '../doctor/components/doctor-topbar/doctor-topbar.component';

// Pharmacist Components
import { PharmacistSidebarComponent } from '../pharmacist/components/pharmacist-sidebar/pharmacist-sidebar.component';
import { PharmacistTopbarComponent } from '../pharmacist/components/pharmacist-topbar/pharmacist-topbar.component';

// Clinic Components
import { ClinicSidebarComponent } from '../clinic/components/clinic-sidebar/clinic-sidebar.component';
import { ClinicTopbarComponent } from '../clinic/components/clinic-topbar/clinic-topbar.component';

// Laboratory Components
import { LaboratoryStaffSidebarComponent } from '../laboratory/components/laboratory-sidebar/laboratory-sidebar.component';
import { LaboratoryStaffTopbarComponent } from '../laboratory/components/laboratory-topbar/laboratory-topbar.component';

// Home Care Components
import { HomeCareSidebarComponent } from '../home-care/components/home-care-sidebar/home-care-sidebar.component';
import { HomeCareTopbarComponent } from '../home-care/components/home-care-topbar/home-care-topbar.component';

import { PasswordModalComponent } from '../patient/components/password-modal/password-modal.component';

@NgModule({
  declarations: [
    PatientSidebarComponent,
    TopbarComponent,
    NutritionistSidebarComponent,
    NutritionistTopbarComponent,
    DoctorSidebarComponent,
    DoctorTopbarComponent,
    PharmacistSidebarComponent,
    PharmacistTopbarComponent,
    ClinicSidebarComponent,
    ClinicTopbarComponent,
    LaboratoryStaffSidebarComponent,
    LaboratoryStaffTopbarComponent,
    HomeCareSidebarComponent,
    HomeCareTopbarComponent,
    PasswordModalComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  exports: [
    PatientSidebarComponent,
    TopbarComponent,
    NutritionistSidebarComponent,
    NutritionistTopbarComponent,
    DoctorSidebarComponent,
    DoctorTopbarComponent,
    PharmacistSidebarComponent,
    PharmacistTopbarComponent,
    ClinicSidebarComponent,
    ClinicTopbarComponent,
    LaboratoryStaffSidebarComponent,
    LaboratoryStaffTopbarComponent,
    HomeCareSidebarComponent,
    HomeCareTopbarComponent,
    PasswordModalComponent,
    RouterModule
  ]
})
export class LayoutModule { }
