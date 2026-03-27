import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NutritionistSidebarComponent } from './components/nutritionist-sidebar/nutritionist-sidebar.component';
import { NutritionistTopbarComponent } from './components/nutritionist-topbar/nutritionist-topbar.component';
import { LayoutModule } from '../layout/layout.module';
import { NutritionistDashboardComponent } from './pages/nutritionist-dashboard/nutritionist-dashboard.component';
import { NutritionistPatientsComponent } from './pages/nutritionist-patients/nutritionist-patients.component';
import { NutritionistPatientDetailComponent } from './pages/nutritionist-patient-detail/nutritionist-patient-detail.component';
import { LifestyleDetailComponent } from '../patient/pages/lifestyle-detail/lifestyle-detail.component';
import { NutritionistLifestyleListComponent } from './pages/nutritionist-lifestyle-list/nutritionist-lifestyle-list.component';
import { NutritionistLifestyleFormComponent } from './pages/nutritionist-lifestyle-form/nutritionist-lifestyle-form.component';
import { LifestyleSharedModule } from '../patient/lifestyle-shared.module';

const routes: Routes = [
    {
        path: 'dashboard',
        component: NutritionistDashboardComponent
    },
    {
        path: 'patients',
        component: NutritionistPatientsComponent
    },
    {
        path: 'patient/:id',
        component: NutritionistPatientDetailComponent
    },
    {
        path: 'patient/:id/lifestyle/:type',
        component: NutritionistLifestyleListComponent
    },
    {
        path: 'patient/:id/lifestyle/:type/new',
        component: NutritionistLifestyleFormComponent
    },
    {
        path: 'patient/:id/lifestyle/:type/edit/:itemid',
        component: NutritionistLifestyleFormComponent
    },
    {
        path: 'patient/:id/lifestyle/:type/view/:itemid',
        component: LifestyleDetailComponent
    }
];

@NgModule({
    declarations: [
        NutritionistDashboardComponent,
        NutritionistPatientsComponent,
        NutritionistPatientDetailComponent,
        NutritionistLifestyleListComponent,
        NutritionistLifestyleFormComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        LifestyleSharedModule,
        LayoutModule
    ]
})
export class NutritionistModule { }
