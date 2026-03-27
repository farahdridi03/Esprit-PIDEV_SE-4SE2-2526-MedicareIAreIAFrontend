import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BackOfficeRoutingModule } from './back-office-routing.module';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { SharedLayoutModule } from '../../shared/layout/shared-layout.module';
import { AdminEventsListComponent } from './pages/events/events-list/admin-events-list.component';
import { AdminEventFormComponent } from './pages/events/event-form/admin-event-form.component';
import { AdminEventRegistrationsComponent } from './pages/events/event-registrations/admin-event-registrations.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    DashboardComponent,
    UserManagementComponent,
    AdminEventsListComponent,
    AdminEventFormComponent,
    AdminEventRegistrationsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BackOfficeRoutingModule,
    SharedLayoutModule
  ]
})
export class BackOfficeModule { }
