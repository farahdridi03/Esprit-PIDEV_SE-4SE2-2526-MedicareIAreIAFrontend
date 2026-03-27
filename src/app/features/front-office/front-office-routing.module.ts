import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrontLayoutComponent } from './layout/front-layout/front-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { ContactComponent } from './pages/contact/contact.component';
import { DashboardComponent } from './patient/pages/dashboard/dashboard.component';
import { DoctorDashboardComponent } from './doctor/pages/doctor-dashboard/doctor-dashboard.component';
import { DoctorProfileComponent } from './doctor/pages/doctor-profile/doctor-profile.component';
import { AuthGuard } from '../../guards/auth.guard';
import { EventsDiscoveryComponent } from './pages/events/events-discovery/events-discovery.component';
import { EventDetailsComponent } from './pages/events/event-details/event-details.component';
import { MyRegistrationsComponent } from './pages/events/my-registrations/my-registrations.component';

const routes: Routes = [
  {
    path: '',
    component: FrontLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'events', component: EventsDiscoveryComponent },
      { path: 'events/:id', component: EventDetailsComponent },
      { path: 'my-event-registrations', component: MyRegistrationsComponent, canActivate: [AuthGuard] }
    ]
  },
  {
    path: 'patient/dashboard',
    component: DashboardComponent,
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


