import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackOfficeComponent } from './back-office.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from '../../guards/auth.guard';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { LaboratoryListComponent } from './pages/laboratory-list/laboratory-list.component';
import { LaboratoryFormComponent } from './pages/laboratory-form/laboratory-form.component';

const routes: Routes = [
  {
    path: '',
    component: BackOfficeComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'users', component: UserManagementComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'emergency', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'events', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'forum', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'donations', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'home-care', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
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
