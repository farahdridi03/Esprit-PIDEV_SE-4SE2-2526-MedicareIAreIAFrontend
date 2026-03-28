import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacistRoutingModule } from './pharmacist-routing.module';
import { PharmacistDashboardComponent } from './pages/pharmacist-dashboard/pharmacist-dashboard.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { PharmacistSidebarComponent } from './components/pharmacist-sidebar/pharmacist-sidebar.component';
import { PharmacistTopbarComponent } from './components/pharmacist-topbar/pharmacist-topbar.component';

@NgModule({
  declarations: [
    PharmacistDashboardComponent,
    OrdersComponent,
    PharmacistSidebarComponent,
    PharmacistTopbarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PharmacistRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PharmacistModule { }
