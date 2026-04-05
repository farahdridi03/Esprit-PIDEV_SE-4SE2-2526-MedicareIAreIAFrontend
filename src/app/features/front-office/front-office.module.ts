import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { FrontOfficeRoutingModule } from './front-office-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { FrontLayoutComponent } from './layout/front-layout/front-layout.component';
import { ContactComponent } from './pages/contact/contact.component';

// Patient components
import { DashboardComponent } from './patient/pages/dashboard/dashboard.component';
import { PatientSidebarComponent } from './patient/components/sidebar/sidebar.component';
import { PatientTopbarComponent } from './patient/components/topbar/topbar.component';
import { DonationsComponent } from './patient/pages/donations/donations.component';
import { EmergencyComponent } from './patient/pages/emergency/emergency.component';
import { PatientProfileComponent } from './patient/pages/patient-profile/patient-profile.component';
import { PatientDoctorsListComponent } from './patient/pages/patient-doctors-list/patient-doctors-list.component';
import { PatientDoctorDetailComponent } from './patient/pages/patient-doctor-detail/patient-doctor-detail.component';
import { PatientAppointmentsComponent } from './patient/pages/patient-appointments/patient-appointments.component';
import { PatientBabyCareComponent } from './patient/pages/patient-baby-care/patient-baby-care.component';

// Doctor components
import { DoctorDashboardComponent } from './doctor/pages/doctor-dashboard/doctor-dashboard.component';
import { DoctorProfileComponent } from './doctor/pages/doctor-profile/doctor-profile.component';
import { DoctorSidebarComponent } from './doctor/components/doctor-sidebar/doctor-sidebar.component';
import { DoctorTopbarComponent } from './doctor/components/doctor-topbar/doctor-topbar.component';
import { DoctorPatientsComponent } from './doctor/pages/doctor-patients/doctor-patients.component';
import { DoctorCalendarCalendarComponent } from './doctor/pages/doctor-calendar-calendar/doctor-calendar-calendar.component';
import { DoctorCalendarExceptionsComponent } from './doctor/pages/doctor-calendar-exceptions/doctor-calendar-exceptions.component';
import { DoctorCalendarSettingsComponent } from './doctor/pages/doctor-calendar-settings/doctor-calendar-settings.component';

@NgModule({
  declarations: [
    FrontLayoutComponent,
    HomeComponent,
    ContactComponent,
    DashboardComponent,
    PatientSidebarComponent,
    PatientTopbarComponent,
    DonationsComponent,
    EmergencyComponent,
    PatientProfileComponent,
    PatientDoctorsListComponent,
    PatientDoctorDetailComponent,
    PatientAppointmentsComponent,
    PatientBabyCareComponent,
    DoctorDashboardComponent,
    DoctorProfileComponent,
    DoctorSidebarComponent,
    DoctorTopbarComponent,
    DoctorPatientsComponent,
    DoctorCalendarCalendarComponent,
    DoctorCalendarExceptionsComponent,
    DoctorCalendarSettingsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FrontOfficeRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class FrontOfficeModule { }
