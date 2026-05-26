import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { LayoutModule } from '../layout/layout.module';
import { LaboratoryStaffProfileSettingsComponent } from './pages/laboratory-profile-settings/laboratory-profile-settings.component';
import { LaboratoryProfileEditComponent } from './pages/laboratory-profile-edit/laboratory-profile-edit.component';
import { LaboratoryDashboardComponent } from './pages/laboratory-dashboard/laboratory-dashboard.component';
import { LaboratoryStaffSidebarComponent } from './components/laboratory-sidebar/laboratory-sidebar.component';
import { LaboratoryTopbarComponent } from './components/laboratory-topbar/laboratory-topbar.component';
import { LabTestsComponent } from './lab-tests/lab-tests.component';
import { LabTestFormComponent } from './lab-tests/lab-test-form.component';
import { LabResultsComponent } from './pages/lab-results/lab-results.component';
import { LabResultFormComponent } from './pages/lab-results/lab-result-form.component';
import { LabRequestsComponent } from './pages/lab-requests/lab-requests.component';
import { LabResultService } from '../../../services/lab-result.service';

const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: LaboratoryDashboardComponent },
    { path: 'requests', component: LabRequestsComponent },
    { path: 'results', component: LabResultsComponent },
    { path: 'lab-tests', component: LabTestsComponent },
    { path: 'profile', component: LaboratoryStaffProfileSettingsComponent },
    { path: 'profile/edit', component: LaboratoryProfileEditComponent },
    { path: 'events', component: LaboratoryDashboardComponent },
    { path: 'forum', component: LaboratoryDashboardComponent },
    { path: 'donations', component: LaboratoryDashboardComponent }
];

@NgModule({
    declarations: [
        LaboratoryDashboardComponent,
        LaboratoryStaffProfileSettingsComponent,
        LaboratoryProfileEditComponent,
        LabTestsComponent,
        LabTestFormComponent,
        LabResultsComponent,
        LabResultFormComponent,
        LabRequestsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        LayoutModule,
        RouterModule.forChild(routes),
        LaboratoryStaffSidebarComponent,
        LaboratoryTopbarComponent
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
