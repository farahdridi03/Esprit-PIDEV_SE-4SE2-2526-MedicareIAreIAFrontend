import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeCareSidebarComponent } from './components/home-care-sidebar/home-care-sidebar.component';
import { HomeCareTopbarComponent } from './components/home-care-topbar/home-care-topbar.component';
import { HomeCareDashboardComponent } from './pages/home-care-dashboard/home-care-dashboard.component';

const routes: Routes = [
    {
        path: '',
        component: HomeCareDashboardComponent
    },
    {
        path: 'dashboard',
        component: HomeCareDashboardComponent
    }
];

@NgModule({
    declarations: [
        HomeCareSidebarComponent,
        HomeCareTopbarComponent,
        HomeCareDashboardComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ]
})
export class HomeCareModule { }
