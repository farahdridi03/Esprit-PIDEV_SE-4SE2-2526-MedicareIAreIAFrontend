import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FrontOfficeRoutingModule } from './front-office-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { FrontLayoutComponent } from './layout/front-layout/front-layout.component';
import { ContactComponent } from './pages/contact/contact.component';
import { DashboardComponent } from './patient/pages/dashboard/dashboard.component';
import { SidebarComponent } from './patient/components/sidebar/sidebar.component';
import { TopbarComponent } from './patient/components/topbar/topbar.component';
import { DoctorSidebarComponent } from './doctor/components/doctor-sidebar/doctor-sidebar.component';
import { DoctorTopbarComponent } from './doctor/components/doctor-topbar/doctor-topbar.component';
import { DoctorDashboardComponent } from './doctor/pages/doctor-dashboard/doctor-dashboard.component';
import { DoctorProfileComponent } from './doctor/pages/doctor-profile/doctor-profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LabRequestsComponent } from './patient/pages/lab-requests/lab-requests.component';


@NgModule({
  declarations: [
    FrontLayoutComponent,
    HomeComponent,
    ContactComponent,
    DashboardComponent,
    SidebarComponent,
    TopbarComponent,
    DoctorSidebarComponent,
    DoctorTopbarComponent,
    DoctorDashboardComponent,
    DoctorProfileComponent,
    LabRequestsComponent
  ],
  imports: [
    CommonModule,
    FrontOfficeRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class FrontOfficeModule { }
