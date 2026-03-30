import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Patient Components
import { SidebarComponent } from '../patient/components/sidebar/sidebar.component';
import { TopbarComponent } from '../patient/components/topbar/topbar.component';

// Nutritionist Components
import { NutritionistSidebarComponent } from '../nutritionist/components/nutritionist-sidebar/nutritionist-sidebar.component';
import { NutritionistTopbarComponent } from '../nutritionist/components/nutritionist-topbar/nutritionist-topbar.component';
import { PasswordModalComponent } from '../patient/components/password-modal/password-modal.component';

@NgModule({
  declarations: [
    SidebarComponent,
    TopbarComponent,
    NutritionistSidebarComponent,
    NutritionistTopbarComponent,
    PasswordModalComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  exports: [
    SidebarComponent,
    TopbarComponent,
    NutritionistSidebarComponent,
    NutritionistTopbarComponent,
    PasswordModalComponent
  ]
})
export class LayoutModule { }
