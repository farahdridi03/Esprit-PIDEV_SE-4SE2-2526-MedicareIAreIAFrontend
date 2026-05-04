import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CourierDashboardComponent } from './pages/courier-dashboard/courier-dashboard.component';

const routes: Routes = [
  { path: 'courier/dashboard', component: CourierDashboardComponent }
];

@NgModule({
  declarations: [
    CourierDashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class DeliveryModule { }
