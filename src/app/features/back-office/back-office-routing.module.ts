import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackOfficeComponent } from './back-office.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from '../../guards/auth.guard';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { DonationsManagementComponent } from './pages/donations-management/donations-management.component';
import { AppointmentManagementComponent } from './pages/appointment-management/appointment-management.component';
import { LaboratoryListComponent } from './pages/laboratory-list/laboratory-list.component';
import { LaboratoryFormComponent } from './pages/laboratory-form/laboratory-form.component';
import { EmergencyManagementComponent } from './pages/emergency-management/emergency-management.component';
import { ForumModerationComponent } from '../../forum/pages/forum-moderation/forum-moderation.component';

import { PharmacistValidationComponent } from './pages/pharmacist-validation/pharmacist-validation.component';
import { AdminProvidersComponent } from './pages/admin-providers/admin-providers.component';
import { AdminRequestsComponent } from './pages/admin-requests/admin-requests.component';
import { EventsListComponent } from './pages/events-list/events-list.component';
import { EventFormComponent } from './pages/event-form/event-form.component';
import { EventRegistrationsComponent } from './pages/event-registrations/event-registrations.component';

const routes: Routes = [
  {
    path: '',
    component: BackOfficeComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'users', component: UserManagementComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'donations', component: DonationsManagementComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'appointments', component: AppointmentManagementComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'emergency', component: EmergencyManagementComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'forum', component: ForumModerationComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'validations', component: PharmacistValidationComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'homecare-providers', component: AdminProvidersComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'homecare-requests', component: AdminRequestsComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'events', component: EventsListComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'events/new', component: EventFormComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'events/edit/:id', component: EventFormComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'events/:id/registrations', component: EventRegistrationsComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'profile', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },

      {
        path: 'laboratories',
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] },
        children: [
          { path: '', component: LaboratoryListComponent },
          { path: 'new', component: LaboratoryFormComponent },
          { path: 'edit/:id', component: LaboratoryFormComponent }
        ]
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackOfficeRoutingModule { }
