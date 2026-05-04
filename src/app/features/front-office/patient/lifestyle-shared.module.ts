import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressChartComponent } from './components/progress-chart/progress-chart.component';
import { LifestyleDetailComponent } from './pages/lifestyle-detail/lifestyle-detail.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { NutritionistSidebarComponent } from '../nutritionist/components/nutritionist-sidebar/nutritionist-sidebar.component';
import { NutritionistTopbarComponent } from '../nutritionist/components/nutritionist-topbar/nutritionist-topbar.component';

@NgModule({
  declarations: [
    ProgressChartComponent,
    LifestyleDetailComponent
  ],
  imports: [
    CommonModule,
    SidebarComponent,
    TopbarComponent,
    NutritionistSidebarComponent,
    NutritionistTopbarComponent
  ],
  exports: [
    ProgressChartComponent,
    LifestyleDetailComponent
  ]
})
export class LifestyleSharedModule { }
