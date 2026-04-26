import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PharmacistRoutingModule } from './pharmacist-routing.module';
import { PharmacistDashboardComponent } from './pages/pharmacist-dashboard/pharmacist-dashboard.component';
import { PharmaciesListComponent } from './pages/pharmacies-list/pharmacies-list.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { InventoryListComponent } from './pages/inventory-list/inventory-list.component';
import { BatchesListComponent } from './pages/batches-list/batches-list.component';
import { MovementsListComponent } from './pages/movements-list/movements-list.component';
import { AlertsListComponent } from './pages/alerts-list/alerts-list.component';
import { SharedLayoutModule } from '../../shared/layout/shared-layout.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PharmacistSetupModalComponent } from './components/pharmacist-setup-modal/pharmacist-setup-modal.component';
import { PharmacistBannerComponent } from './components/pharmacist-banner/pharmacist-banner.component';

@NgModule({
  declarations: [
    PharmacistDashboardComponent,
    PharmaciesListComponent,
    ProductListComponent,
    InventoryListComponent,
    BatchesListComponent,
    MovementsListComponent,
    AlertsListComponent,
    PharmacistSetupModalComponent,
    PharmacistBannerComponent
  ],
  imports: [
    CommonModule,
    PharmacistRoutingModule,
    SharedLayoutModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class PharmacistModule { }
