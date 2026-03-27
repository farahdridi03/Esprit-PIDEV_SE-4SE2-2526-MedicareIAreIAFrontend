import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressChartComponent } from './components/progress-chart/progress-chart.component';

@NgModule({
  declarations: [
    ProgressChartComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ProgressChartComponent
  ]
})
export class LifestyleSharedModule { }
