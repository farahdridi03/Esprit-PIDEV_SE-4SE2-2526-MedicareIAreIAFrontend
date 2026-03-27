import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PharmacistRoutingModule } from './pharmacist-routing.module';
import { PharmacistDashboardComponent } from './pages/pharmacist-dashboard/pharmacist-dashboard.component';
import { PharmacistSidebarComponent } from './components/pharmacist-sidebar/pharmacist-sidebar.component';
import { PharmacistTopbarComponent } from './components/pharmacist-topbar/pharmacist-topbar.component';

@NgModule({
  declarations: [
    PharmacistDashboardComponent,
    PharmacistSidebarComponent,
    PharmacistTopbarComponent
  ],
  imports: [
    CommonModule,
    PharmacistRoutingModule
  ]
})
export class PharmacistModule { }
