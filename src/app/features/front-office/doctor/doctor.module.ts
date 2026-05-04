import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Pages
import { DoctorDashboardComponent } from './pages/doctor-dashboard/doctor-dashboard.component';
import { DoctorProfileComponent } from './pages/doctor-profile/doctor-profile.component';
import { DoctorProfileEditComponent } from './pages/doctor-profile-edit/doctor-profile-edit.component';
import { DoctorPatientsComponent } from './pages/doctor-patients/doctor-patients.component';
import { DoctorCalendarCalendarComponent } from './pages/doctor-calendar-calendar/doctor-calendar-calendar.component';
import { DoctorCalendarExceptionsComponent } from './pages/doctor-calendar-exceptions/doctor-calendar-exceptions.component';
import { DoctorCalendarSettingsComponent } from './pages/doctor-calendar-settings/doctor-calendar-settings.component';
import { DoctorMedicalRecordComponent } from './pages/doctor-medical-record/doctor-medical-record.component';
import { DoctorConsultationsComponent } from './pages/doctor-consultations/doctor-consultations.component';
import { DoctorTreatmentsComponent } from './pages/doctor-treatments/doctor-treatments.component';
import { DoctorPrescriptionsComponent } from './pages/doctor-prescriptions/doctor-prescriptions.component';
import { DoctorDiagnosesComponent } from './pages/doctor-diagnoses/doctor-diagnoses.component';
import { DoctorConsultationDetailsComponent } from './pages/doctor-consultation-details/doctor-consultation-details.component';
import { DoctorPatientConsultationsComponent } from './pages/doctor-patient-consultations/doctor-patient-consultations.component';
import { DoctorPatientTreatmentsComponent } from './pages/doctor-patient-treatments/doctor-patient-treatments.component';
import { DoctorPatientPrescriptionsComponent } from './pages/doctor-patient-prescriptions/doctor-patient-prescriptions.component';
import { DoctorPatientDiagnosesComponent } from './pages/doctor-patient-diagnoses/doctor-patient-diagnoses.component';
import { DoctorWorkloadComponent } from './pages/doctor-workload/doctor-workload.component';

// Layout (Standalone)
import { DoctorSidebarComponent } from './components/doctor-sidebar/doctor-sidebar.component';
import { DoctorTopbarComponent } from './components/doctor-topbar/doctor-topbar.component';
import { PasswordModalComponent } from '../patient/components/password-modal/password-modal.component';

@NgModule({
  declarations: [
    DoctorDashboardComponent,
    DoctorProfileComponent,
    DoctorProfileEditComponent,
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
    DoctorPatientDiagnosesComponent,
    DoctorWorkloadComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DoctorSidebarComponent,
    DoctorTopbarComponent,
    PasswordModalComponent
  ],
  exports: [
    DoctorDashboardComponent,
    DoctorProfileComponent,
    DoctorProfileEditComponent,
    DoctorPatientsComponent,
    DoctorWorkloadComponent
  ]
})
export class DoctorModule { }
