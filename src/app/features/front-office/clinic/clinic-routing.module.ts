import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClinicDashboardComponent } from './pages/clinic-dashboard/clinic-dashboard.component';
import { ClinicProfileSettingsComponent } from './pages/clinic-profile-settings/clinic-profile-settings.component';
import { ClinicProfileEditComponent } from './pages/clinic-profile-edit/clinic-profile-edit.component';
import { AuthGuard } from '../../../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: ClinicDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['CLINIC'] }
  },
  {
    path: 'profile',
    component: ClinicProfileSettingsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['CLINIC'] }
  },
  {
    path: 'profile/edit',
    component: ClinicProfileEditComponent,
    canActivate: [AuthGuard],
    data: { roles: ['CLINIC'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClinicRoutingModule { }
