import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LaboratoryStaffSidebarComponent } from './components/laboratory-sidebar/laboratory-sidebar.component';
import { LaboratoryStaffTopbarComponent } from './components/laboratory-topbar/laboratory-topbar.component';
import { LaboratoryStaffDashboardComponent } from './pages/laboratory-dashboard/laboratory-dashboard.component';

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
    { path: 'profile', component: LaboratoryStaffDashboardComponent }
];

@NgModule({
    declarations: [
        LaboratoryStaffSidebarComponent,
        LaboratoryStaffTopbarComponent,
        LaboratoryStaffDashboardComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ]
})
export class LaboratoryStaffModule { }
