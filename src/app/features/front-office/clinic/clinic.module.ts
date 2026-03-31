import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ClinicRoutingModule } from './clinic-routing.module';
import { LayoutModule } from '../layout/layout.module';

import { ClinicDashboardComponent } from './pages/clinic-dashboard/clinic-dashboard.component';
import { ClinicEmergencyComponent } from './pages/clinic-emergency/clinic-emergency.component';
import { ClinicAmbulancesComponent } from './pages/clinic-ambulances/clinic-ambulances.component';
import { ClinicProfileSettingsComponent } from './pages/clinic-profile-settings/clinic-profile-settings.component';
import { ClinicProfileEditComponent } from './pages/clinic-profile-edit/clinic-profile-edit.component';

@NgModule({
  declarations: [
    ClinicDashboardComponent,
    ClinicEmergencyComponent,
    ClinicAmbulancesComponent,
    ClinicProfileSettingsComponent,
    ClinicProfileEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ClinicRoutingModule,
    LayoutModule
  ]
})
export class ClinicModule { }
