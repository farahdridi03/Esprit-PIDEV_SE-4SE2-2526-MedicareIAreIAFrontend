import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicRoutingModule } from './clinic-routing.module';
import { ClinicDashboardComponent } from './pages/clinic-dashboard/clinic-dashboard.component';
import { ClinicSidebarComponent } from './components/clinic-sidebar/clinic-sidebar.component';
import { ClinicTopbarComponent } from './components/clinic-topbar/clinic-topbar.component';

@NgModule({
  declarations: [
    ClinicDashboardComponent,
    ClinicSidebarComponent,
    ClinicTopbarComponent
  ],
  imports: [
    CommonModule,
    ClinicRoutingModule
  ]
})
export class ClinicModule { }
