import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { FrontOfficeRoutingModule } from './front-office-routing.module';
import { LayoutModule } from './layout/layout.module';
import { LifestyleSharedModule } from './patient/lifestyle-shared.module';

// Patient components
import { DashboardComponent } from './patient/pages/dashboard/dashboard.component';
import { PatientDoctorsListComponent } from './patient/pages/patient-doctors-list/patient-doctors-list.component';
import { PatientDoctorDetailComponent } from './patient/pages/patient-doctor-detail/patient-doctor-detail.component';
import { PatientNutritionistsListComponent } from './patient/pages/patient-nutritionists-list/patient-nutritionists-list.component';
import { PatientNutritionistDetailComponent } from './patient/pages/patient-nutritionist-detail/patient-nutritionist-detail.component';
import { PatientAppointmentsComponent } from './patient/pages/patient-appointments/patient-appointments.component';
import { PatientBabyCareComponent } from './patient/pages/patient-baby-care/patient-baby-care.component';
import { PatientProfileComponent } from './patient/pages/patient-profile/patient-profile.component';
import { DonationsComponent } from './patient/pages/donations/donations.component';
import { EmergencyComponent } from './patient/pages/emergency/emergency.component';
import { MedicalRecordComponent } from './patient/pages/medical-record/medical-record.component';
import { PatientRecordListComponent } from './patient/pages/patient-record-list/patient-record-list.component';
import { LifestyleWellnessComponent } from './patient/pages/lifestyle-wellness/lifestyle-wellness.component';
import { LifestyleListComponent } from './patient/pages/lifestyle-list/lifestyle-list.component';
import { LifestyleFormComponent } from './patient/pages/lifestyle-form/lifestyle-form.component';
import { PatientProfileSettingsComponent } from './patient/pages/patient-profile-settings/patient-profile-settings.component';
import { PatientProfileEditComponent } from './patient/pages/patient-profile-edit/patient-profile-edit.component';
import { LabRequestsComponent } from './patient/pages/lab-requests/lab-requests.component';
import { LabRequestFormComponent } from './patient/pages/lab-requests/lab-request-form/lab-request-form.component';
import { PharmacyComponent } from './patient/pages/pharmacy/pharmacy.component';
import { PharmacyOrderCreateComponent } from './patient/pages/pharmacy-order-create/pharmacy-order-create.component';
import { PharmacyOrderListComponent } from './patient/pages/pharmacy-order-list/pharmacy-order-list.component';
import { PharmacyOrderDetailComponent } from './patient/pages/pharmacy-order-detail/pharmacy-order-detail.component';

// Doctor components
import { DoctorDashboardComponent } from './doctor/pages/doctor-dashboard/doctor-dashboard.component';
import { DoctorProfileComponent } from './doctor/pages/doctor-profile/doctor-profile.component';
import { ProviderCalendarSharedModule } from './doctor/provider-calendar-shared.module';
import { DoctorPatientsComponent } from './doctor/pages/doctor-patients/doctor-patients.component';
import { DoctorMedicalRecordComponent } from './doctor/pages/doctor-medical-record/doctor-medical-record.component';
import { DoctorConsultationsComponent } from './doctor/pages/doctor-consultations/doctor-consultations.component';
import { DoctorTreatmentsComponent } from './doctor/pages/doctor-treatments/doctor-treatments.component';
import { DoctorPrescriptionsComponent } from './doctor/pages/doctor-prescriptions/doctor-prescriptions.component';
import { DoctorDiagnosesComponent } from './doctor/pages/doctor-diagnoses/doctor-diagnoses.component';
import { DoctorConsultationDetailsComponent } from './doctor/pages/doctor-consultation-details/doctor-consultation-details.component';
import { DoctorPatientConsultationsComponent } from './doctor/pages/doctor-patient-consultations/doctor-patient-consultations.component';
import { DoctorPatientTreatmentsComponent } from './doctor/pages/doctor-patient-treatments/doctor-patient-treatments.component';
import { DoctorPatientPrescriptionsComponent } from './doctor/pages/doctor-patient-prescriptions/doctor-patient-prescriptions.component';
import { DoctorPatientDiagnosesComponent } from './doctor/pages/doctor-patient-diagnoses/doctor-patient-diagnoses.component';
import { DoctorSidebarComponent } from './doctor/components/doctor-sidebar/doctor-sidebar.component';
import { DoctorTopbarComponent } from './doctor/components/doctor-topbar/doctor-topbar.component';

// Layout & Static components
import { HomeComponent } from './pages/home/home.component';
import { FrontLayoutComponent } from './layout/front-layout/front-layout.component';
import { ContactComponent } from './pages/contact/contact.component';
import { SidebarComponent } from './patient/components/sidebar/sidebar.component';
import { TopbarComponent } from './patient/components/topbar/topbar.component';
import { CourierDashboardComponent } from './delivery/pages/courier-dashboard/courier-dashboard.component';
import { HomecareCatalogComponent } from './patient/pages/homecare-catalog/homecare-catalog.component';
import { HomecareRequestListComponent } from './patient/pages/homecare-request-list/homecare-request-list.component';
import { HomecareBookComponent } from './patient/pages/homecare-book/homecare-book.component';
import { HomecareReviewComponent } from './patient/pages/homecare-review/homecare-review.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { PatientEventsComponent } from './pages/patient-events/patient-events.component';
import { LaboratoryStaffSidebarComponent } from './laboratory/components/laboratory-sidebar/laboratory-sidebar.component';
import { LaboratoryTopbarComponent } from './laboratory/components/laboratory-topbar/laboratory-topbar.component';

@NgModule({
  declarations: [
    DashboardComponent,
    PatientDoctorsListComponent,
    PatientDoctorDetailComponent,
    PatientNutritionistsListComponent,
    PatientNutritionistDetailComponent,
    PatientAppointmentsComponent,
    PatientBabyCareComponent,
    PatientProfileComponent,
    PatientProfileSettingsComponent,
    PatientProfileEditComponent,
    DonationsComponent,
    EmergencyComponent,
    MedicalRecordComponent,
    PatientRecordListComponent,
    LifestyleWellnessComponent,
    LifestyleListComponent,
    LifestyleFormComponent,
    LabRequestsComponent,
    LabRequestFormComponent,
    DoctorDashboardComponent,
    DoctorProfileComponent,
    DoctorPatientsComponent,
    DoctorMedicalRecordComponent,
    DoctorConsultationsComponent,
    DoctorTreatmentsComponent,
    DoctorPrescriptionsComponent,
    DoctorDiagnosesComponent,
    DoctorConsultationDetailsComponent,
    DoctorPatientConsultationsComponent,
    DoctorPatientTreatmentsComponent,
    DoctorPatientPrescriptionsComponent,
    DoctorPatientDiagnosesComponent,
    HomeComponent,
    FrontLayoutComponent,
    ContactComponent,
    PharmacyComponent,
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
    RouterModule,
    FrontOfficeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    LifestyleSharedModule,
    ProviderCalendarSharedModule,
    LayoutModule,
    EventDetailComponent,
    PatientEventsComponent,
    SidebarComponent,
    TopbarComponent,
    DoctorSidebarComponent,
    DoctorTopbarComponent,
    LaboratoryStaffSidebarComponent,
    LaboratoryTopbarComponent,
    PharmacyOrderCreateComponent
  ],
  exports: [
    DashboardComponent,
    PatientDoctorsListComponent,
    PatientDoctorDetailComponent,
    PatientNutritionistsListComponent,
    PatientNutritionistDetailComponent,
    PatientAppointmentsComponent,
    PatientBabyCareComponent,
    PatientProfileComponent,
    DoctorDashboardComponent,
    DoctorProfileComponent,
    DoctorPatientsComponent,
    HomeComponent,
    ContactComponent
  ]
})
export class FrontOfficeModule { }
