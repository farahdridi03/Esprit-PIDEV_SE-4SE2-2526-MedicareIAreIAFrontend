import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BackOfficeRoutingModule } from './back-office-routing.module';
import { BackOfficeComponent } from './back-office.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from './components/admin-topbar/admin-topbar.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { DonationsManagementComponent } from './pages/donations-management/donations-management.component';
import { AppointmentManagementComponent } from './pages/appointment-management/appointment-management.component';


@NgModule({
  declarations: [
    BackOfficeComponent,
    DashboardComponent,
    AdminSidebarComponent,
    AdminTopbarComponent,
    UserManagementComponent,
    DonationsManagementComponent,
    AppointmentManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    BackOfficeRoutingModule
  ]
})
export class BackOfficeModule { }
