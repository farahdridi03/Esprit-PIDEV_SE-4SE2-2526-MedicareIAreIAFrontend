import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FrontOfficeRoutingModule } from './front-office-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { FrontLayoutComponent } from './layout/front-layout/front-layout.component';
import { ContactComponent } from './pages/contact/contact.component';
import { DashboardComponent } from './patient/pages/dashboard/dashboard.component';
import { LayoutModule } from './layout/layout.module';
import { DoctorSidebarComponent } from './doctor/components/doctor-sidebar/doctor-sidebar.component';
import { DoctorTopbarComponent } from './doctor/components/doctor-topbar/doctor-topbar.component';
import { DoctorDashboardComponent } from './doctor/pages/doctor-dashboard/doctor-dashboard.component';
import { DoctorProfileComponent } from './doctor/pages/doctor-profile/doctor-profile.component';
import { DoctorPatientsComponent } from './doctor/pages/doctor-patients/doctor-patients.component';
import { DoctorMedicalRecordComponent } from './doctor/pages/doctor-medical-record/doctor-medical-record.component';
import { DoctorConsultationsComponent } from './doctor/pages/doctor-consultations/doctor-consultations.component';
import { DoctorTreatmentsComponent } from './doctor/pages/doctor-treatments/doctor-treatments.component';
import { DoctorPrescriptionsComponent } from './doctor/pages/doctor-prescriptions/doctor-prescriptions.component';
import { DoctorDiagnosesComponent } from './doctor/pages/doctor-diagnoses/doctor-diagnoses.component';
import { MedicalRecordComponent } from './patient/pages/medical-record/medical-record.component';
import { FormsModule } from '@angular/forms';
import { DoctorConsultationDetailsComponent } from './doctor/pages/doctor-consultation-details/doctor-consultation-details.component';
import { DoctorPatientConsultationsComponent } from './doctor/pages/doctor-patient-consultations/doctor-patient-consultations.component';
import { DoctorPatientTreatmentsComponent } from './doctor/pages/doctor-patient-treatments/doctor-patient-treatments.component';
import { DoctorPatientPrescriptionsComponent } from './doctor/pages/doctor-patient-prescriptions/doctor-patient-prescriptions.component';
import { DoctorPatientDiagnosesComponent } from './doctor/pages/doctor-patient-diagnoses/doctor-patient-diagnoses.component';
import { PatientRecordListComponent } from './patient/pages/patient-record-list/patient-record-list.component';
import { LifestyleWellnessComponent } from './patient/pages/lifestyle-wellness/lifestyle-wellness.component';
import { LifestyleListComponent } from './patient/pages/lifestyle-list/lifestyle-list.component';
import { LifestyleFormComponent } from './patient/pages/lifestyle-form/lifestyle-form.component';
import { LifestyleSharedModule } from './patient/lifestyle-shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PatientProfileSettingsComponent } from './patient/pages/patient-profile-settings/patient-profile-settings.component';
import { PatientProfileEditComponent } from './patient/pages/patient-profile-edit/patient-profile-edit.component';


@NgModule({
  declarations: [
    FrontLayoutComponent,
    HomeComponent,
    ContactComponent,
    DashboardComponent,
    DoctorSidebarComponent,
    DoctorTopbarComponent,
    DoctorDashboardComponent,
    DoctorProfileComponent,
    DoctorPatientsComponent,
    DoctorMedicalRecordComponent,
    DoctorConsultationsComponent,
    DoctorTreatmentsComponent,
    DoctorPrescriptionsComponent,
    DoctorDiagnosesComponent,
    MedicalRecordComponent,
    DoctorConsultationDetailsComponent,
    DoctorPatientConsultationsComponent,
    DoctorPatientTreatmentsComponent,
    DoctorPatientPrescriptionsComponent,
    DoctorPatientDiagnosesComponent,
    PatientRecordListComponent,
    LifestyleWellnessComponent,
    LifestyleListComponent,
    LifestyleFormComponent,
    PatientProfileSettingsComponent,
    PatientProfileEditComponent
  ],
  imports: [
    CommonModule,
    FrontOfficeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    LifestyleSharedModule,
    LayoutModule
  ]
})
export class FrontOfficeModule { }
