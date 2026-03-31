import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { BackOfficeRoutingModule } from './back-office-routing.module';
import { BackOfficeComponent } from './back-office.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from './components/admin-topbar/admin-topbar.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { PharmacistValidationComponent } from './pages/pharmacist-validation/pharmacist-validation.component';
import { AdminProvidersComponent } from './pages/admin-providers/admin-providers.component';
import { AdminRequestsComponent } from './pages/admin-requests/admin-requests.component';
import { EventsListComponent } from './pages/events-list/events-list.component';
import { EventFormComponent } from './pages/event-form/event-form.component';
import { EventRegistrationsComponent } from './pages/event-registrations/event-registrations.component';

@NgModule({
  declarations: [
    BackOfficeComponent,
    DashboardComponent,
    AdminSidebarComponent,
    AdminTopbarComponent,
    UserManagementComponent,
    PharmacistValidationComponent,
    AdminProvidersComponent,
    AdminRequestsComponent,
    EventFormComponent,
    EventRegistrationsComponent,
    EventsListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BackOfficeRoutingModule
  ]
})
export class BackOfficeModule { }
