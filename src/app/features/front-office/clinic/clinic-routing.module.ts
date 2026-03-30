import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClinicDashboardComponent } from './pages/clinic-dashboard/clinic-dashboard.component';
<<<<<<< HEAD
import { ClinicEmergencyComponent } from './pages/clinic-emergency/clinic-emergency.component';
import { ClinicAmbulancesComponent } from './pages/clinic-ambulances/clinic-ambulances.component';
=======
import { ClinicProfileSettingsComponent } from './pages/clinic-profile-settings/clinic-profile-settings.component';
import { ClinicProfileEditComponent } from './pages/clinic-profile-edit/clinic-profile-edit.component';
>>>>>>> origin/frontVersion1
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
<<<<<<< HEAD
    path: 'emergency',
    component: ClinicEmergencyComponent,
=======
    path: 'profile',
    component: ClinicProfileSettingsComponent,
>>>>>>> origin/frontVersion1
    canActivate: [AuthGuard],
    data: { roles: ['CLINIC'] }
  },
  {
<<<<<<< HEAD
    path: 'ambulances',
    component: ClinicAmbulancesComponent,
=======
    path: 'profile/edit',
    component: ClinicProfileEditComponent,
>>>>>>> origin/frontVersion1
    canActivate: [AuthGuard],
    data: { roles: ['CLINIC'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClinicRoutingModule { }
