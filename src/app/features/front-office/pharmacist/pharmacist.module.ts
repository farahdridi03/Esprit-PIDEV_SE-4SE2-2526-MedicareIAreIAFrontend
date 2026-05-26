import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PharmacistRoutingModule } from './pharmacist-routing.module';
import { PharmacistDashboardComponent } from './pages/pharmacist-dashboard/pharmacist-dashboard.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { PharmacistProfileComponent } from './pages/pharmacist-profile/pharmacist-profile.component';
import { AlertsListComponent } from './pages/alerts-list/alerts-list.component';
import { BatchesListComponent } from './pages/batches-list/batches-list.component';
import { InventoryListComponent } from './pages/inventory-list/inventory-list.component';
import { MovementsListComponent } from './pages/movements-list/movements-list.component';
import { PharmaciesListComponent } from './pages/pharmacies-list/pharmacies-list.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { LayoutModule } from '../layout/layout.module';

@NgModule({
  declarations: [
    PharmacistDashboardComponent,
    OrdersComponent,
    // PharmacistSidebarComponent and PharmacistTopbarComponent are already declared in LayoutModule
    PharmacistProfileComponent,
    AlertsListComponent,
    BatchesListComponent,
    InventoryListComponent,
    MovementsListComponent,
    PharmaciesListComponent,
    ProductListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PharmacistRoutingModule,
    LayoutModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PharmacistModule { }
