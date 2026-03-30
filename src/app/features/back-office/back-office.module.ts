import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
=======
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
>>>>>>> origin/frontVersion1

import { BackOfficeRoutingModule } from './back-office-routing.module';
import { BackOfficeComponent } from './back-office.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from './components/admin-topbar/admin-topbar.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
<<<<<<< HEAD
import { DonationsManagementComponent } from './pages/donations-management/donations-management.component';
import { AppointmentManagementComponent } from './pages/appointment-management/appointment-management.component';
=======
import { LaboratoryListComponent } from './pages/laboratory-list/laboratory-list.component';
import { LaboratoryFormComponent } from './pages/laboratory-form/laboratory-form.component';
>>>>>>> origin/frontVersion1


@NgModule({
  declarations: [
    BackOfficeComponent,
    DashboardComponent,
    AdminSidebarComponent,
    AdminTopbarComponent,
    UserManagementComponent,
<<<<<<< HEAD
    DonationsManagementComponent,
    AppointmentManagementComponent
=======
    LaboratoryListComponent,
    LaboratoryFormComponent
>>>>>>> origin/frontVersion1
  ],
  imports: [
    CommonModule,
    FormsModule,
<<<<<<< HEAD
    RouterModule,
=======
    ReactiveFormsModule,
>>>>>>> origin/frontVersion1
    BackOfficeRoutingModule
  ]
})
export class BackOfficeModule { }
