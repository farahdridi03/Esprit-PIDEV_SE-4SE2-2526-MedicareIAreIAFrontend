import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrontLayoutComponent } from './layout/front-layout/front-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { ContactComponent } from './pages/contact/contact.component';
import { DashboardComponent } from './patient/pages/dashboard/dashboard.component';
import { DonationsComponent } from './patient/pages/donations/donations.component';
import { EmergencyComponent } from './patient/pages/emergency/emergency.component';
import { DoctorDashboardComponent } from './doctor/pages/doctor-dashboard/doctor-dashboard.component';
import { DoctorProfileComponent } from './doctor/pages/doctor-profile/doctor-profile.component';
import { PatientProfileComponent } from './patient/pages/patient-profile/patient-profile.component';
import { PatientDoctorsListComponent } from './patient/pages/patient-doctors-list/patient-doctors-list.component';
import { PatientDoctorDetailComponent } from './patient/pages/patient-doctor-detail/patient-doctor-detail.component';
import { PatientAppointmentsComponent } from './patient/pages/patient-appointments/patient-appointments.component';
import { PatientBabyCareComponent } from './patient/pages/patient-baby-care/patient-baby-care.component';
import { DoctorPatientsComponent } from './doctor/pages/doctor-patients/doctor-patients.component';
import { DoctorCalendarCalendarComponent } from './doctor/pages/doctor-calendar-calendar/doctor-calendar-calendar.component';
import { DoctorCalendarExceptionsComponent } from './doctor/pages/doctor-calendar-exceptions/doctor-calendar-exceptions.component';
import { DoctorCalendarSettingsComponent } from './doctor/pages/doctor-calendar-settings/doctor-calendar-settings.component';
import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: FrontLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'contact', component: ContactComponent }
    ]
  },
  {
    path: 'patient/dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PATIENT'] }
  },
  {
    path: 'patient/donations',
    component: DonationsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PATIENT'] }
  },
  {
    path: 'patient/emergency',
    component: EmergencyComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PATIENT'] }
  },
  {
    path: 'patient/appointments',
    component: PatientAppointmentsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PATIENT'] }
  },
  {
    path: 'patient/doctors',
    component: PatientDoctorsListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PATIENT'] }
  },
  {
    path: 'patient/doctors/:id',
    component: PatientDoctorDetailComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PATIENT'] }
  },
  {
    path: 'patient/baby-care',
    component: PatientBabyCareComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PATIENT'] }
  },
  {
    path: 'patient/profile',
    component: PatientProfileComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PATIENT'] }
  },
  {
    path: 'doctor/dashboard',
    component: DoctorDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['DOCTOR'] }
  },
  {
    path: 'doctor/profile',
    component: DoctorProfileComponent,
    canActivate: [AuthGuard],
    data: { roles: ['DOCTOR'] }
  },
  {
    path: 'doctor/patients',
    component: DoctorPatientsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['DOCTOR'] }
  },
  {
    path: 'doctor/calendar',
    component: DoctorCalendarCalendarComponent,
    canActivate: [AuthGuard],
    data: { roles: ['DOCTOR'] }
  },
  {
    path: 'doctor/calendar/exceptions',
    component: DoctorCalendarExceptionsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['DOCTOR'] }
  },
  {
    path: 'doctor/calendar/settings',
    component: DoctorCalendarSettingsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['DOCTOR'] }
  },
  {
    path: 'nutritionist',
    loadChildren: () =>
      import('./nutritionist/nutritionist.module')
        .then(m => m.NutritionistModule)
  },
  {
    path: 'laboratorystaff',
    loadChildren: () =>
      import('./laboratory/laboratory.module')
        .then(m => m.LaboratoryStaffModule)
  },
  {
    path: 'home-care',
    loadChildren: () =>
      import('./home-care/home-care.module')
        .then(m => m.HomeCareModule)
  },
  {
    path: 'pharmacist',
    loadChildren: () =>
      import('./pharmacist/pharmacist.module')
        .then(m => m.PharmacistModule)
  },
  {
    path: 'clinic',
    loadChildren: () =>
      import('./clinic/clinic.module')
        .then(m => m.ClinicModule)
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrontOfficeRoutingModule { }


