import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BackOfficeRoutingModule } from './back-office-routing.module';
import { BackOfficeComponent } from './back-office.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from './components/admin-topbar/admin-topbar.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { AppointmentManagementComponent } from './pages/appointment-management/appointment-management.component';


@NgModule({
  declarations: [
    BackOfficeComponent,
    DashboardComponent,
    AdminSidebarComponent,
    AdminTopbarComponent,
    UserManagementComponent,
    AppointmentManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BackOfficeRoutingModule
  ]
})
export class BackOfficeModule { }
