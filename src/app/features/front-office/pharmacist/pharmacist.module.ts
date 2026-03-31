import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PharmacistRoutingModule } from './pharmacist-routing.module';
import { PharmacistDashboardComponent } from './pages/pharmacist-dashboard/pharmacist-dashboard.component';
import { LayoutModule } from '../layout/layout.module';

@NgModule({
  declarations: [
    PharmacistDashboardComponent
  ],
  imports: [
    CommonModule,
    PharmacistRoutingModule,
    LayoutModule
  ]
})
export class PharmacistModule { }
