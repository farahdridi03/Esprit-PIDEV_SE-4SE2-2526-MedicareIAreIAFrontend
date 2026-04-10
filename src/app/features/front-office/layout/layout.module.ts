import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { FrontLayoutComponent } from './front-layout/front-layout.component';
// Patient Components
import { PatientSidebarComponent } from '../patient/components/sidebar/sidebar.component';
import { PatientTopbarComponent } from '../patient/components/topbar/topbar.component';
import { PasswordModalComponent } from '../patient/components/password-modal/password-modal.component';

// Doctor Components
import { DoctorSidebarComponent } from '../doctor/components/doctor-sidebar/doctor-sidebar.component';
import { DoctorTopbarComponent } from '../doctor/components/doctor-topbar/doctor-topbar.component';

// Nutritionist Components
import { NutritionistSidebarComponent } from '../nutritionist/components/nutritionist-sidebar/nutritionist-sidebar.component';
import { NutritionistTopbarComponent } from '../nutritionist/components/nutritionist-topbar/nutritionist-topbar.component';

@NgModule({
  declarations: [
    FrontLayoutComponent,
    PatientSidebarComponent,
    PatientTopbarComponent,
    PasswordModalComponent,
    DoctorSidebarComponent,
    DoctorTopbarComponent,
    NutritionistSidebarComponent,
    NutritionistTopbarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  exports: [
    FrontLayoutComponent,
    PatientSidebarComponent,
    PatientTopbarComponent,
    PasswordModalComponent,
    DoctorSidebarComponent,
    DoctorTopbarComponent,
    NutritionistSidebarComponent,
    NutritionistTopbarComponent
  ]
})
export class LayoutModule { }
