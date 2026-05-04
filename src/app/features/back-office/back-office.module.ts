import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BackOfficeRoutingModule } from './back-office-routing.module';
import { BackOfficeComponent } from './back-office.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { SharedLayoutModule } from '../../shared/layout/shared-layout.module';

// Components
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from './components/admin-topbar/admin-topbar.component';

// Pages
import { AdminProvidersComponent } from './pages/admin-providers/admin-providers.component';
import { AdminRequestsComponent } from './pages/admin-requests/admin-requests.component';
import { AppointmentManagementComponent } from './pages/appointment-management/appointment-management.component';
import { DonationsManagementComponent } from './pages/donations-management/donations-management.component';
import { EventFormComponent } from './pages/event-form/event-form.component';
import { EventRegistrationsComponent } from './pages/event-registrations/event-registrations.component';
import { EventsListComponent } from './pages/events-list/events-list.component';
import { AdminLaboratoryFormComponent } from './pages/laboratory-form/admin-laboratory-form.component';
import { PharmacistValidationComponent } from './pages/pharmacist-validation/pharmacist-validation.component';

// Legacy/Other Event Pages
import { AdminEventsListComponent } from './pages/events/events-list/admin-events-list.component';
import { AdminEventFormComponent } from './pages/events/event-form/admin-event-form.component';
import { AdminEventRegistrationsComponent } from './pages/events/event-registrations/admin-event-registrations.component';
import { EventSeatEditorComponent } from './pages/event-seat-editor/event-seat-editor.component';
import { EventAnalyticsComponent } from './pages/event-analytics/event-analytics.component';
import { AdminEventSuggestionsComponent } from './pages/event-suggestions/admin-event-suggestions.component';
import { SeatCountPipe } from './pages/event-seat-editor/seat-count.pipe';

@NgModule({
  declarations: [
    BackOfficeComponent,
    AdminSidebarComponent,
    AdminTopbarComponent,
    DashboardComponent,
    UserManagementComponent,
    AdminProvidersComponent,
    AdminRequestsComponent,
    AppointmentManagementComponent,
    DonationsManagementComponent,
    EventFormComponent,
    EventRegistrationsComponent,
    EventsListComponent,
    AdminLaboratoryFormComponent,
    PharmacistValidationComponent,
    AdminEventsListComponent,
    AdminEventFormComponent,
    AdminEventRegistrationsComponent,
    EventSeatEditorComponent,
    EventAnalyticsComponent,
    AdminEventSuggestionsComponent,
    SeatCountPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    BackOfficeRoutingModule,
    SharedLayoutModule
  ]
})
export class BackOfficeModule { }
