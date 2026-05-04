import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { FrontOfficeRoutingModule } from './front-office-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { FrontLayoutComponent } from './layout/front-layout/front-layout.component';
import { ContactComponent } from './pages/contact/contact.component';
import { MyRegistrationsComponent } from './pages/events/my-registrations/my-registrations.component';
import { PatientEventsComponent } from './pages/patient-events/patient-events.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { PatientModule } from './patient/patient.module';
import { DoctorModule } from './doctor/doctor.module';
import { DeliveryModule } from './delivery/delivery.module';

@NgModule({
  declarations: [
    HomeComponent,
    ContactComponent,
    MyRegistrationsComponent
  ],
  imports: [
    CommonModule,
    FrontOfficeRoutingModule,
    FormsModule,
    PatientModule,
    DoctorModule,
    DeliveryModule,
    PatientEventsComponent,
    EventDetailComponent,
    FrontLayoutComponent
  ]
})
export class FrontOfficeModule { }
