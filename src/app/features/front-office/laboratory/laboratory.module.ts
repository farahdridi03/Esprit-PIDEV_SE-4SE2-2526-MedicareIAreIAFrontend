import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { LayoutModule } from '../layout/layout.module';
import { LaboratoryStaffProfileSettingsComponent } from './pages/laboratory-profile-settings/laboratory-profile-settings.component';
import { LaboratoryProfileEditComponent } from './pages/laboratory-profile-edit/laboratory-profile-edit.component';


import { LaboratoryStaffSidebarComponent } from './components/laboratory-sidebar/laboratory-sidebar.component';
import { LaboratoryStaffTopbarComponent } from './components/laboratory-topbar/laboratory-topbar.component';
import { LaboratoryStaffDashboardComponent } from './pages/laboratory-dashboard/laboratory-dashboard.component';
import { LabTestsComponent } from './lab-tests/lab-tests.component';
import { LabTestFormComponent } from './lab-tests/lab-test-form.component';
import { LabResultsComponent } from './pages/lab-results/lab-results.component';
import { LabResultFormComponent } from './pages/lab-results/lab-result-form.component';
import { LaboratoryStaffLabRequestsComponent } from './pages/lab-requests/lab-requests.component';
import { LabResultService } from '../../../services/lab-result.service';


const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: LaboratoryStaffDashboardComponent },
    { path: 'events', component: LaboratoryStaffDashboardComponent },
    { path: 'forum', component: LaboratoryStaffDashboardComponent },
    { path: 'donations', component: LaboratoryStaffDashboardComponent },

    { path: 'profile', component: LaboratoryStaffProfileSettingsComponent },
    { path: 'profile/edit', component: LaboratoryProfileEditComponent },

    { path: 'lab-tests', component: LabTestsComponent },
    { path: 'lab-requests', component: LaboratoryStaffLabRequestsComponent },
    { path: 'lab-results', component: LabResultsComponent },


];

@NgModule({
    declarations: [
        LaboratoryStaffSidebarComponent,
        LaboratoryStaffTopbarComponent,
        LaboratoryStaffDashboardComponent,
        LaboratoryStaffProfileSettingsComponent,
        LaboratoryProfileEditComponent,
        LabTestsComponent,
        LabTestFormComponent,
        LabResultsComponent,
        LabResultFormComponent,
        LaboratoryStaffLabRequestsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        LayoutModule,
        RouterModule.forChild(routes)
    ],
    providers: [
        LabResultService
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule
    ]
})
export class LaboratoryStaffModule { }
