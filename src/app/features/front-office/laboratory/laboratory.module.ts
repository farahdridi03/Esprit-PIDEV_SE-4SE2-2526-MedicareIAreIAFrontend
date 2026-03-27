import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { LaboratoryStaffSidebarComponent } from './components/laboratory-sidebar/laboratory-sidebar.component';
import { LaboratoryStaffTopbarComponent } from './components/laboratory-topbar/laboratory-topbar.component';
import { LaboratoryStaffDashboardComponent } from './pages/laboratory-dashboard/laboratory-dashboard.component';
import { LabManagementListComponent } from './pages/lab-management-list/lab-management-list.component';
import { LabManagementFormComponent } from './pages/lab-management-form/lab-management-form.component';
import { LabTestsComponent } from './lab-tests/lab-tests.component';
import { LabTestFormComponent } from './lab-tests/lab-test-form.component';
import { LabResultsComponent } from './pages/lab-results/lab-results.component';
import { LabResultFormComponent } from './pages/lab-results/lab-result-form.component';
import { LabResultService } from '../../../services/lab-result.service';

const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: LaboratoryStaffDashboardComponent },
    { path: 'requests', component: LaboratoryStaffDashboardComponent },
    { path: 'results', component: LaboratoryStaffDashboardComponent },
    { path: 'events', component: LaboratoryStaffDashboardComponent },
    { path: 'forum', component: LaboratoryStaffDashboardComponent },
    { path: 'donations', component: LaboratoryStaffDashboardComponent },
    { path: 'profile', component: LaboratoryStaffDashboardComponent },
    { path: 'lab-tests', component: LabTestsComponent },
    { path: 'lab-requests', component: LaboratoryStaffDashboardComponent },
    { path: 'lab-results', component: LabResultsComponent },
    {
        path: 'laboratories',
        children: [
            { path: '', component: LabManagementListComponent },
            { path: 'new', component: LabManagementFormComponent },
            { path: 'edit/:id', component: LabManagementFormComponent }
        ]
    }
];

@NgModule({
    declarations: [
        LaboratoryStaffSidebarComponent,
        LaboratoryStaffTopbarComponent,
        LaboratoryStaffDashboardComponent,
        LabManagementListComponent,
        LabManagementFormComponent,
        LabTestsComponent,
        LabTestFormComponent,
        LabResultsComponent,
        LabResultFormComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
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
