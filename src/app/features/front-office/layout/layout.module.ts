import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Patient Components
import { SidebarComponent } from '../patient/components/sidebar/sidebar.component';
import { TopbarComponent } from '../patient/components/topbar/topbar.component';

// Nutritionist Components
import { NutritionistSidebarComponent } from '../nutritionist/components/nutritionist-sidebar/nutritionist-sidebar.component';
import { NutritionistTopbarComponent } from '../nutritionist/components/nutritionist-topbar/nutritionist-topbar.component';

@NgModule({
  declarations: [
    SidebarComponent,
    TopbarComponent,
    NutritionistSidebarComponent,
    NutritionistTopbarComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    SidebarComponent,
    TopbarComponent,
    NutritionistSidebarComponent,
    NutritionistTopbarComponent
  ]
})
export class LayoutModule { }
