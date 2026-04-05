import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Patient Components
import { PatientSidebarComponent } from '../patient/components/sidebar/sidebar.component';
import { PatientTopbarComponent } from '../patient/components/topbar/topbar.component';
import { PasswordModalComponent } from '../patient/components/password-modal/password-modal.component';

// Nutritionist Components
import { NutritionistSidebarComponent } from '../nutritionist/components/nutritionist-sidebar/nutritionist-sidebar.component';
import { NutritionistTopbarComponent } from '../nutritionist/components/nutritionist-topbar/nutritionist-topbar.component';

@NgModule({
  declarations: [
    PatientSidebarComponent,
    PatientTopbarComponent,
    PasswordModalComponent,
    NutritionistSidebarComponent,
    NutritionistTopbarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  exports: [
    PatientSidebarComponent,
    PatientTopbarComponent,
    PasswordModalComponent,
    NutritionistSidebarComponent,
    NutritionistTopbarComponent
  ]
})
export class LayoutModule { }
