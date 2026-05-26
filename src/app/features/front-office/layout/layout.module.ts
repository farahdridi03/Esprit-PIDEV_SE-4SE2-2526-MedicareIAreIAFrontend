import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Standalone Components
import { SidebarComponent } from '../patient/components/sidebar/sidebar.component';
import { TopbarComponent } from '../patient/components/topbar/topbar.component';
import { NutritionistSidebarComponent } from '../nutritionist/components/nutritionist-sidebar/nutritionist-sidebar.component';
import { NutritionistTopbarComponent } from '../nutritionist/components/nutritionist-topbar/nutritionist-topbar.component';
import { DoctorSidebarComponent } from '../doctor/components/doctor-sidebar/doctor-sidebar.component';
import { DoctorTopbarComponent } from '../doctor/components/doctor-topbar/doctor-topbar.component';
import { PharmacistSidebarComponent } from '../pharmacist/components/pharmacist-sidebar/pharmacist-sidebar.component';
import { PharmacistTopbarComponent } from '../pharmacist/components/pharmacist-topbar/pharmacist-topbar.component';
import { ClinicSidebarComponent } from '../clinic/components/clinic-sidebar/clinic-sidebar.component';
import { ClinicTopbarComponent } from '../clinic/components/clinic-topbar/clinic-topbar.component';
import { LaboratoryStaffSidebarComponent } from '../laboratory/components/laboratory-sidebar/laboratory-sidebar.component';
import { LaboratoryTopbarComponent } from '../laboratory/components/laboratory-topbar/laboratory-topbar.component';
import { HomeCareSidebarComponent } from '../home-care/components/home-care-sidebar/home-care-sidebar.component';
import { HomeCareTopbarComponent } from '../home-care/components/home-care-topbar/home-care-topbar.component';

import { PasswordModalComponent } from '../patient/components/password-modal/password-modal.component';

@NgModule({
  declarations: [
    PasswordModalComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    SidebarComponent,
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
    LaboratoryTopbarComponent,
    HomeCareSidebarComponent,
    HomeCareTopbarComponent
  ],
  exports: [
    SidebarComponent,
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
    LaboratoryTopbarComponent,
    HomeCareSidebarComponent,
    HomeCareTopbarComponent,
    PasswordModalComponent,
    RouterModule
  ]
})
export class LayoutModule { }
