import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BackOfficeRoutingModule } from './back-office-routing.module';
import { BackOfficeComponent } from './back-office.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from './components/admin-topbar/admin-topbar.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { ForumModule } from '../../forum/forum.module';

@NgModule({
  declarations: [
    BackOfficeComponent,
    DashboardComponent,
    AdminSidebarComponent,
    AdminTopbarComponent,
    UserManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BackOfficeRoutingModule,
    ForumModule
  ]
})
export class BackOfficeModule { }