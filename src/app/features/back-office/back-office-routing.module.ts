import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackOfficeComponent } from './back-office.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from '../../guards/auth.guard';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { DonationsManagementComponent } from './pages/donations-management/donations-management.component';
import { AppointmentManagementComponent } from './pages/appointment-management/appointment-management.component';

import { AdminLaboratoryListComponent } from './pages/laboratory-list/admin-laboratory-list.component';
import { AdminLaboratoryFormComponent } from './pages/laboratory-form/admin-laboratory-form.component';

import { ForumModerationComponent } from '../../forum/pages/forum-moderation/forum-moderation.component';

const routes: Routes = [
  {
    path: '',
    component: BackOfficeComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'users', component: UserManagementComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'donations', component: DonationsManagementComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'appointments', component: AppointmentManagementComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'emergency', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'events', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'forum', component: ForumModerationComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'home-care', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'profile', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      {
        path: 'laboratories',
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] },
        children: [
          { path: '', component: AdminLaboratoryListComponent },
          { path: 'new', component: AdminLaboratoryFormComponent },
          { path: 'edit/:id', component: AdminLaboratoryFormComponent }
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
