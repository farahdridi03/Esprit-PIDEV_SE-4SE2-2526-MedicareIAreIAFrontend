import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrontLayoutComponent } from './layout/front-layout/front-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { ContactComponent } from './pages/contact/contact.component';
import { DashboardComponent } from './patient/pages/dashboard/dashboard.component';
import { PharmacyComponent } from './patient/pages/pharmacy/pharmacy.component';
import { PharmacyOrderCreateComponent } from './patient/pages/pharmacy-order-create/pharmacy-order-create.component';
import { PharmacyOrderListComponent } from './patient/pages/pharmacy-order-list/pharmacy-order-list.component';
import { PharmacyOrderDetailComponent } from './patient/pages/pharmacy-order-detail/pharmacy-order-detail.component';
import { CourierDashboardComponent } from './delivery/pages/courier-dashboard/courier-dashboard.component';
import { DoctorDashboardComponent } from './doctor/pages/doctor-dashboard/doctor-dashboard.component';
import { DoctorProfileComponent } from './doctor/pages/doctor-profile/doctor-profile.component';
import { HomecareCatalogComponent } from './patient/pages/homecare-catalog/homecare-catalog.component';
import { HomecareRequestListComponent } from './patient/pages/homecare-request-list/homecare-request-list.component';
import { HomecareBookComponent } from './patient/pages/homecare-book/homecare-book.component';
import { HomecareReviewComponent } from './patient/pages/homecare-review/homecare-review.component';
import { AuthGuard } from '../../guards/auth.guard';
import { PharmaciesListComponent } from './pharmacist/pages/pharmacies-list/pharmacies-list.component';
import { ProductListComponent } from './pharmacist/pages/product-list/product-list.component';
import { InventoryListComponent } from './pharmacist/pages/inventory-list/inventory-list.component';
import { BatchesListComponent } from './pharmacist/pages/batches-list/batches-list.component';
import { MovementsListComponent } from './pharmacist/pages/movements-list/movements-list.component';
import { AlertsListComponent } from './pharmacist/pages/alerts-list/alerts-list.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { PatientEventsComponent } from './pages/patient-events/patient-events.component';

const routes: Routes = [
  {
    path: '',
    component: FrontLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'events', component: PatientEventsComponent, canActivate: [AuthGuard] },
      { path: 'events/:id', component: EventDetailComponent, canActivate: [AuthGuard] }
    ]
  },

  {
    path: 'patient/dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PATIENT'] }
  },
  {
    path: 'patient/pharmacy',
    component: PharmacyComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PATIENT'] }
  },
  {
    path: 'patient/pharmacy-orders/new',
    component: PharmacyOrderCreateComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PATIENT'] }
  },
  {
    path: 'patient/pharmacy-orders',
    component: PharmacyOrderListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PATIENT'] }
  },
  {
    path: 'patient/pharmacy-orders/:id',
    component: PharmacyOrderDetailComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PATIENT'] }
  },
  {
    path: 'patient/homecare',
    component: HomecareCatalogComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PATIENT'] }
  },
  {
    path: 'patient/homecare/book/:serviceId',
    component: HomecareBookComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PATIENT'] }
  },
  {
    path: 'patient/homecare/my-requests',
    component: HomecareRequestListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PATIENT'] }
  },
  {
    path: 'patient/homecare/review/:requestId',
    component: HomecareReviewComponent,
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
    path: 'delivery/courier-dashboard',
    component: CourierDashboardComponent,
    canActivate: [AuthGuard]
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


