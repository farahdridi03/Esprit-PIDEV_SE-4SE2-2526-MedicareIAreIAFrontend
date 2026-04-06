import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { FrontOfficeRoutingModule } from './front-office-routing.module';
import { LayoutModule } from './layout/layout.module';
import { LifestyleSharedModule } from './patient/lifestyle-shared.module';

import { HomeComponent } from './pages/home/home.component';
import { FrontLayoutComponent } from './layout/front-layout/front-layout.component';
import { ContactComponent } from './pages/contact/contact.component';

// Patient components
import { DashboardComponent } from './patient/pages/dashboard/dashboard.component';
import { DonationsComponent } from './patient/pages/donations/donations.component';
import { EmergencyComponent } from './patient/pages/emergency/emergency.component';
import { PatientProfileComponent } from './patient/pages/patient-profile/patient-profile.component';
import { PatientDoctorsListComponent } from './patient/pages/patient-doctors-list/patient-doctors-list.component';
import { PatientDoctorDetailComponent } from './patient/pages/patient-doctor-detail/patient-doctor-detail.component';
import { PatientAppointmentsComponent } from './patient/pages/patient-appointments/patient-appointments.component';
import { PatientBabyCareComponent } from './patient/pages/patient-baby-care/patient-baby-care.component';
import { MedicalRecordComponent } from './patient/pages/medical-record/medical-record.component';
import { PatientRecordListComponent } from './patient/pages/patient-record-list/patient-record-list.component';
import { LifestyleWellnessComponent } from './patient/pages/lifestyle-wellness/lifestyle-wellness.component';
import { LifestyleListComponent } from './patient/pages/lifestyle-list/lifestyle-list.component';
import { LifestyleFormComponent } from './patient/pages/lifestyle-form/lifestyle-form.component';
import { PatientProfileSettingsComponent } from './patient/pages/patient-profile-settings/patient-profile-settings.component';
import { PatientProfileEditComponent } from './patient/pages/patient-profile-edit/patient-profile-edit.component';
import { PatientLabRequestsComponent } from './patient/pages/lab-requests/lab-requests.component';
import { PatientLabRequestFormComponent } from './patient/pages/lab-requests/lab-request-form/lab-request-form.component';

// Doctor components
import { DoctorDashboardComponent } from './doctor/pages/doctor-dashboard/doctor-dashboard.component';
import { DoctorProfileComponent } from './doctor/pages/doctor-profile/doctor-profile.component';
import { DoctorPatientsComponent } from './doctor/pages/doctor-patients/doctor-patients.component';
import { DoctorCalendarCalendarComponent } from './doctor/pages/doctor-calendar-calendar/doctor-calendar-calendar.component';
import { DoctorCalendarExceptionsComponent } from './doctor/pages/doctor-calendar-exceptions/doctor-calendar-exceptions.component';
import { DoctorCalendarSettingsComponent } from './doctor/pages/doctor-calendar-settings/doctor-calendar-settings.component';
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

@NgModule({
  declarations: [
    HomeComponent,
    ContactComponent,
    DashboardComponent,
    DonationsComponent,
    EmergencyComponent,
    PatientProfileComponent,
    PatientDoctorsListComponent,
    PatientDoctorDetailComponent,
    PatientAppointmentsComponent,
    PatientBabyCareComponent,
    MedicalRecordComponent,
    PatientRecordListComponent,
    LifestyleWellnessComponent,
    LifestyleListComponent,
    LifestyleFormComponent,
    PatientProfileSettingsComponent,
    PatientProfileEditComponent,
    PatientLabRequestFormComponent,
    PatientLabRequestsComponent,
    DoctorDashboardComponent,
    DoctorProfileComponent,
    DoctorPatientsComponent,
    DoctorCalendarCalendarComponent,
    DoctorCalendarExceptionsComponent,
    DoctorCalendarSettingsComponent,
    DoctorMedicalRecordComponent,
    DoctorConsultationsComponent,
    DoctorTreatmentsComponent,
    DoctorPrescriptionsComponent,
    DoctorDiagnosesComponent,
    DoctorConsultationDetailsComponent,
    DoctorPatientConsultationsComponent,
    DoctorPatientTreatmentsComponent,
    DoctorPatientPrescriptionsComponent,
    DoctorPatientDiagnosesComponent
  ],
  imports: [
    SharedModule,
    FrontOfficeRoutingModule,
    LifestyleSharedModule,
    LayoutModule
  ]
})
export class FrontOfficeModule { }
