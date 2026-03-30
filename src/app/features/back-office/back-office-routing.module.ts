import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackOfficeComponent } from './back-office.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from '../../guards/auth.guard';

import { UserManagementComponent } from './pages/user-management/user-management.component';
import { DonationsManagementComponent } from './pages/donations-management/donations-management.component';
import { AppointmentManagementComponent } from './pages/appointment-management/appointment-management.component';

const routes: Routes = [
  {
    path: '',
    component: BackOfficeComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'users', component: UserManagementComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'donations', component: DonationsManagementComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'appointments', component: AppointmentManagementComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackOfficeRoutingModule { }
