import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressChartComponent } from './components/progress-chart/progress-chart.component';
import { LayoutModule } from '../layout/layout.module';

import { LifestyleDetailComponent } from './pages/lifestyle-detail/lifestyle-detail.component';

@NgModule({
  declarations: [
    ProgressChartComponent,
    LifestyleDetailComponent
  ],
  imports: [
    CommonModule,
    LayoutModule
  ],
  exports: [
    ProgressChartComponent,
    LifestyleDetailComponent
  ]
})
export class LifestyleSharedModule { }
