import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

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
import { AuthGuard } from '../../guards/auth.guard';
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
      { path: 'forum', component: ForumModerationComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
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
  declarations: [
    BackOfficeComponent,
    DashboardComponent,
    UserManagementComponent,
    DonationsManagementComponent,
    AppointmentManagementComponent,
    AdminSidebarComponent,
    AdminTopbarComponent,
    AdminLaboratoryListComponent,
    AdminLaboratoryFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    ForumModule
  ],
  exports: [
    AdminSidebarComponent,
    AdminTopbarComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BackOfficeModule { }
