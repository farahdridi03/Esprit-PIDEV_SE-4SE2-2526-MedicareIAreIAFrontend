import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicRoutingModule } from './clinic-routing.module';
import { ClinicDashboardComponent } from './pages/clinic-dashboard/clinic-dashboard.component';
import { ClinicSidebarComponent } from './components/clinic-sidebar/clinic-sidebar.component';
import { ClinicTopbarComponent } from './components/clinic-topbar/clinic-topbar.component';
import { ClinicProfileSettingsComponent } from './pages/clinic-profile-settings/clinic-profile-settings.component';
import { ClinicProfileEditComponent } from './pages/clinic-profile-edit/clinic-profile-edit.component';
import { LayoutModule } from '../layout/layout.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ClinicDashboardComponent,
    ClinicSidebarComponent,
    ClinicTopbarComponent,
    ClinicProfileSettingsComponent,
    ClinicProfileEditComponent
  ],
  imports: [
    CommonModule,
    ClinicRoutingModule,
    LayoutModule,
    ReactiveFormsModule
  ]
})
export class ClinicModule { }
