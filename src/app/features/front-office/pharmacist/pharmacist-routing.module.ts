import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PharmacistDashboardComponent } from './pages/pharmacist-dashboard/pharmacist-dashboard.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { PharmacistProfileComponent } from './pages/pharmacist-profile/pharmacist-profile.component';
import { AuthGuard } from '../../../guards/auth.guard';
import { PharmaciesListComponent } from './pages/pharmacies-list/pharmacies-list.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { InventoryListComponent } from './pages/inventory-list/inventory-list.component';
import { BatchesListComponent } from './pages/batches-list/batches-list.component';
import { MovementsListComponent } from './pages/movements-list/movements-list.component';
import { AlertsListComponent } from './pages/alerts-list/alerts-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: PharmacistDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PHARMACIST'] }
  },
  {
    path: 'orders',
    component: OrdersComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PHARMACIST'] }
  },
  {
    path: 'profile',
    component: PharmacistProfileComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PHARMACIST'] }
  },
  {
    path: 'pharmacies',
    component: PharmaciesListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PHARMACIST'] }
  },
  
  {
    path: 'products',
    component: ProductListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PHARMACIST'] }
  },
  {
    path: 'inventory',
    component: InventoryListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PHARMACIST'] }
  },
  {
    path: 'batches/:pharmacyStockId',
    component: BatchesListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PHARMACIST'] }
  },
  {
    path: 'movements/:pharmacyStockId',
    component: MovementsListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PHARMACIST'] }
  },
  {
    path: 'alerts',
    component: AlertsListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PHARMACIST'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PharmacistRoutingModule { }
