import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModule } from '../layout/layout.module';
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
        HomeCareDashboardComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        LayoutModule
    ]
})
export class HomeCareModule { }
