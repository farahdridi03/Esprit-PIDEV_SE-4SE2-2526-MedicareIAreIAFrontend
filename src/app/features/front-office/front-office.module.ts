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
import { FormsModule } from '@angular/forms';
import { EventsDiscoveryComponent } from './pages/events/events-discovery/events-discovery.component';
import { EventDetailsComponent } from './pages/events/event-details/event-details.component';
import { MyRegistrationsComponent } from './pages/events/my-registrations/my-registrations.component';
import { PatientEventsComponent } from './patient/pages/events/patient-events.component';


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
    EventsDiscoveryComponent,
    EventDetailsComponent,
    MyRegistrationsComponent,
    PatientEventsComponent
  ],
  imports: [
    CommonModule,
    FrontOfficeRoutingModule,
    FormsModule
  ]
})
export class FrontOfficeModule { }
