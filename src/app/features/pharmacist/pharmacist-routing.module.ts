import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from '../../shared/layout/app-layout.component';
import { PharmacistDashboardComponent } from './pages/pharmacist-dashboard/pharmacist-dashboard.component';
import { PharmaciesListComponent } from './pages/pharmacies-list/pharmacies-list.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { InventoryListComponent } from './pages/inventory-list/inventory-list.component';
import { BatchesListComponent } from './pages/batches-list/batches-list.component';
import { MovementsListComponent } from './pages/movements-list/movements-list.component';
import { AlertsListComponent } from './pages/alerts-list/alerts-list.component';
import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
  {
    path: 'stock',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PHARMACIST'] },
    children: [
      { path: 'dashboard', component: PharmacistDashboardComponent },
      { path: 'pharmacies', component: PharmaciesListComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'inventory', component: InventoryListComponent },
      { path: 'batches/:pharmacyStockId', component: BatchesListComponent },
      { path: 'movements/:pharmacyStockId', component: MovementsListComponent },
      { path: 'alerts', component: AlertsListComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PharmacistRoutingModule { }
