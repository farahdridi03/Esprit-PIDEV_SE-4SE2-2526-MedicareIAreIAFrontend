import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LaboratorySidebarComponent } from './components/laboratory-sidebar/laboratory-sidebar.component';
import { LaboratoryTopbarComponent } from './components/laboratory-topbar/laboratory-topbar.component';
import { LaboratoryDashboardComponent } from './pages/laboratory-dashboard/laboratory-dashboard.component';

const routes: Routes = [
    {
        path: '',
        component: LaboratoryDashboardComponent
    }
];

@NgModule({
    declarations: [
        LaboratorySidebarComponent,
        LaboratoryTopbarComponent,
        LaboratoryDashboardComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ]
})
export class LaboratoryModule { }
