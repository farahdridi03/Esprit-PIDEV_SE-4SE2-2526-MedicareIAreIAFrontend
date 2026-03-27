import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from '../../shared/layout/app-layout.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from '../../guards/auth.guard';

import { UserManagementComponent } from './pages/user-management/user-management.component';
import { AdminEventsListComponent } from './pages/events/events-list/admin-events-list.component';
import { AdminEventFormComponent } from './pages/events/event-form/admin-event-form.component';
import { AdminEventRegistrationsComponent } from './pages/events/event-registrations/admin-event-registrations.component';

const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'users', component: UserManagementComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'emergency', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'events', component: AdminEventsListComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'events/create', component: AdminEventFormComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'events/edit/:id', component: AdminEventFormComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'events/:id/registrations', component: AdminEventRegistrationsComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'forum', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'donations', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'home-care', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'profile', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackOfficeRoutingModule { }
