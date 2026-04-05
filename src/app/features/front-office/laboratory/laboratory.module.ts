import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModule } from '../layout/layout.module';
import { LaboratoryStaffSidebarComponent } from './components/laboratory-sidebar/laboratory-sidebar.component';
import { LaboratoryStaffTopbarComponent } from './components/laboratory-topbar/laboratory-topbar.component';
import { LaboratoryStaffDashboardComponent } from './pages/laboratory-dashboard/laboratory-dashboard.component';
import { LaboratoryStaffProfileSettingsComponent } from './pages/laboratory-profile-settings/laboratory-profile-settings.component';
import { LaboratoryProfileEditComponent } from './pages/laboratory-profile-edit/laboratory-profile-edit.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        component: LaboratoryStaffDashboardComponent
    },
    { path: 'requests', component: LaboratoryStaffDashboardComponent },
    { path: 'results', component: LaboratoryStaffDashboardComponent },
    { path: 'events', component: LaboratoryStaffDashboardComponent },
    { path: 'forum', component: LaboratoryStaffDashboardComponent },
    { path: 'donations', component: LaboratoryStaffDashboardComponent },
    { path: 'profile', component: LaboratoryStaffProfileSettingsComponent },
    { path: 'profile/edit', component: LaboratoryProfileEditComponent }
];

import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        LaboratoryStaffSidebarComponent,
        LaboratoryStaffTopbarComponent,
        LaboratoryStaffDashboardComponent,
        LaboratoryStaffProfileSettingsComponent,
        LaboratoryProfileEditComponent
    ],
    imports: [
        CommonModule,
        LayoutModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes)
    ]
})
export class LaboratoryStaffModule { }
