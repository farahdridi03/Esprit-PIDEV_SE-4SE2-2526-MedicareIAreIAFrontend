import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FrontOfficeRoutingModule } from './front-office-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { FrontLayoutComponent } from './layout/front-layout/front-layout.component';
import { ContactComponent } from './pages/contact/contact.component';
import { DashboardComponent } from './patient/pages/dashboard/dashboard.component';
import { PharmacyComponent } from './patient/pages/pharmacy/pharmacy.component';
import { SidebarComponent } from './patient/components/sidebar/sidebar.component';
import { TopbarComponent } from './patient/components/topbar/topbar.component';
import { DoctorSidebarComponent } from './doctor/components/doctor-sidebar/doctor-sidebar.component';
import { DoctorTopbarComponent } from './doctor/components/doctor-topbar/doctor-topbar.component';
import { DoctorDashboardComponent } from './doctor/pages/doctor-dashboard/doctor-dashboard.component';
import { DoctorProfileComponent } from './doctor/pages/doctor-profile/doctor-profile.component';
import { PharmacyOrderCreateComponent } from './patient/pages/pharmacy-order-create/pharmacy-order-create.component';
import { PharmacyOrderListComponent } from './patient/pages/pharmacy-order-list/pharmacy-order-list.component';
import { PharmacyOrderDetailComponent } from './patient/pages/pharmacy-order-detail/pharmacy-order-detail.component';
import { CourierDashboardComponent } from './delivery/pages/courier-dashboard/courier-dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { HomecareCatalogComponent } from './patient/pages/homecare-catalog/homecare-catalog.component';
import { HomecareRequestListComponent } from './patient/pages/homecare-request-list/homecare-request-list.component';
import { HomecareBookComponent } from './patient/pages/homecare-book/homecare-book.component';
import { HomecareReviewComponent } from './patient/pages/homecare-review/homecare-review.component';

@NgModule({
  declarations: [
    FrontLayoutComponent,
    HomeComponent,
    ContactComponent,
    DashboardComponent,
    PharmacyComponent,
    DoctorSidebarComponent,
    DoctorTopbarComponent,
    DoctorDashboardComponent,
    DoctorProfileComponent,
    PharmacyOrderCreateComponent,
    PharmacyOrderListComponent,
    PharmacyOrderDetailComponent,
    CourierDashboardComponent,
    HomecareCatalogComponent,
    HomecareRequestListComponent,
    HomecareBookComponent,
    HomecareReviewComponent
  ],
  imports: [
    CommonModule,
    FrontOfficeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SidebarComponent,
    TopbarComponent
  ],
  exports: [

  ]
})
export class FrontOfficeModule { }
