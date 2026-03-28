import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LaboratoryStaffSidebarComponent } from './components/laboratory-sidebar/laboratory-sidebar.component';
import { LaboratoryTopbarComponent } from './components/laboratory-topbar/laboratory-topbar.component';
import { LaboratoryDashboardComponent } from './pages/laboratory-dashboard/laboratory-dashboard.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        component: LaboratoryDashboardComponent
    },
    { path: 'requests', component: LaboratoryDashboardComponent },
    { path: 'results', component: LaboratoryDashboardComponent },
    { path: 'events', component: LaboratoryDashboardComponent },
    { path: 'forum', component: LaboratoryDashboardComponent },
    { path: 'donations', component: LaboratoryDashboardComponent },
    { path: 'profile', component: LaboratoryDashboardComponent }
];

@NgModule({
    declarations: [
        LaboratoryStaffSidebarComponent,
        LaboratoryTopbarComponent,
        LaboratoryDashboardComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ]
})
export class LaboratoryStaffModule { }
