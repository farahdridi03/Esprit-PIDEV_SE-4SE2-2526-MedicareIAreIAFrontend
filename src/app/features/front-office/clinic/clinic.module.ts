import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClinicRoutingModule } from './clinic-routing.module';

// Pages
import { ClinicDashboardComponent } from './pages/clinic-dashboard/clinic-dashboard.component';
import { ClinicAmbulancesComponent } from './pages/clinic-ambulances/clinic-ambulances.component';
import { ClinicEmergencyComponent } from './pages/clinic-emergency/clinic-emergency.component';
import { ClinicProfileEditComponent } from './pages/clinic-profile-edit/clinic-profile-edit.component';
import { ClinicProfileSettingsComponent } from './pages/clinic-profile-settings/clinic-profile-settings.component';

// Components
import { ClinicSidebarComponent } from './components/clinic-sidebar/clinic-sidebar.component';
import { ClinicTopbarComponent } from './components/clinic-topbar/clinic-topbar.component';
import { PasswordModalComponent } from '../patient/components/password-modal/password-modal.component';

@NgModule({
  declarations: [
    ClinicDashboardComponent,
    ClinicAmbulancesComponent,
    ClinicEmergencyComponent,
    ClinicProfileEditComponent,
    ClinicProfileSettingsComponent,
    ClinicSidebarComponent,
    ClinicTopbarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ClinicRoutingModule,
    PasswordModalComponent
  ]
})
export class ClinicModule { }
