import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { NutritionistSidebarComponent } from './components/nutritionist-sidebar/nutritionist-sidebar.component';
import { NutritionistTopbarComponent } from './components/nutritionist-topbar/nutritionist-topbar.component';
import { NutritionistDashboardComponent } from './pages/nutritionist-dashboard/nutritionist-dashboard.component';

const routes: Routes = [
    {
        path: 'dashboard',
        component: NutritionistDashboardComponent
    }
];

@NgModule({
    declarations: [
        NutritionistSidebarComponent,
        NutritionistTopbarComponent,
        NutritionistDashboardComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ]
})
export class NutritionistModule { }
