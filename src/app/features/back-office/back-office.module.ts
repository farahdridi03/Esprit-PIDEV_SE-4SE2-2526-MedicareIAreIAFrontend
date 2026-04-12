import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BackOfficeComponent } from './back-office.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from './components/admin-topbar/admin-topbar.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { DonationsManagementComponent } from './pages/donations-management/donations-management.component';
import { AppointmentManagementComponent } from './pages/appointment-management/appointment-management.component';
import { AdminLaboratoryListComponent } from './pages/laboratory-list/admin-laboratory-list.component';
import { AdminLaboratoryFormComponent } from './pages/laboratory-form/admin-laboratory-form.component';
import { ForumModule } from '../../forum/forum.module';
import { ForumModerationComponent } from '../../forum/pages/forum-moderation/forum-moderation.component';
import { PharmacistValidationComponent } from './pages/pharmacist-validation/pharmacist-validation.component';
import { AdminProvidersComponent } from './pages/admin-providers/admin-providers.component';
import { AdminRequestsComponent } from './pages/admin-requests/admin-requests.component';
import { EventsListComponent } from './pages/events-list/events-list.component';
import { EventFormComponent } from './pages/event-form/event-form.component';
import { EventRegistrationsComponent } from './pages/event-registrations/event-registrations.component';
import { BackOfficeRoutingModule } from './back-office-routing.module';

@NgModule({
  declarations: [
    BackOfficeComponent,
    DashboardComponent,
    UserManagementComponent,
    DonationsManagementComponent,
    AppointmentManagementComponent,
    AdminSidebarComponent,
    AdminTopbarComponent,
    AdminLaboratoryListComponent,
    AdminLaboratoryFormComponent,
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
    BackOfficeRoutingModule,
    ForumModule
  ],
  exports: [
    AdminSidebarComponent,
    AdminTopbarComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BackOfficeModule { }
