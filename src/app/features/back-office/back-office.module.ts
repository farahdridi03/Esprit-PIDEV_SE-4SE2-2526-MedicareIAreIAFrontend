
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BackOfficeRoutingModule } from './back-office-routing.module';
import { BackOfficeComponent } from './back-office.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from './components/admin-topbar/admin-topbar.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { DonationsManagementComponent } from './pages/donations-management/donations-management.component';
import { AppointmentManagementComponent } from './pages/appointment-management/appointment-management.component';
import { LaboratoryListComponent } from './pages/laboratory-list/laboratory-list.component';
import { LaboratoryFormComponent } from './pages/laboratory-form/laboratory-form.component';
import { EmergencyManagementComponent } from './pages/emergency-management/emergency-management.component';
import { ForumModule } from '../../forum/forum.module';


@NgModule({
  declarations: [
    BackOfficeComponent,
    DashboardComponent,
    AdminSidebarComponent,
    AdminTopbarComponent,
    UserManagementComponent,
    DonationsManagementComponent,
    AppointmentManagementComponent,
    LaboratoryListComponent,
    LaboratoryFormComponent,
    EmergencyManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    BackOfficeRoutingModule,
    ForumModule
  ]
})
export class BackOfficeModule { }


