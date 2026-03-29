import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClinicRoutingModule } from './clinic-routing.module';
import { ClinicDashboardComponent } from './pages/clinic-dashboard/clinic-dashboard.component';
import { ClinicSidebarComponent } from './components/clinic-sidebar/clinic-sidebar.component';
import { ClinicTopbarComponent } from './components/clinic-topbar/clinic-topbar.component';
import { ClinicEmergencyComponent } from './pages/clinic-emergency/clinic-emergency.component';
import { ClinicAmbulancesComponent } from './pages/clinic-ambulances/clinic-ambulances.component';

@NgModule({
  declarations: [
    ClinicDashboardComponent,
    ClinicSidebarComponent,
    ClinicTopbarComponent,
    ClinicEmergencyComponent,
    ClinicAmbulancesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ClinicRoutingModule
  ]
})
export class ClinicModule { }

