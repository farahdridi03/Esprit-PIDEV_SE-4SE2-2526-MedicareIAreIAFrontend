import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeCareSidebarComponent } from './components/home-care-sidebar/home-care-sidebar.component';
import { HomeCareTopbarComponent } from './components/home-care-topbar/home-care-topbar.component';
import { HomeCareDashboardComponent } from './pages/home-care-dashboard/home-care-dashboard.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProviderAvailabilityComponent } from './pages/provider-availability/provider-availability.component';
import { ProviderDashboardComponent } from './pages/provider-dashboard/provider-dashboard.component';
import { ProviderRequestDetailComponent } from './pages/provider-request-detail/provider-request-detail.component';

const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: HomeCareDashboardComponent },
    { path: 'provider/dashboard', component: ProviderDashboardComponent },
    { path: 'provider/availability', component: ProviderAvailabilityComponent },
    { path: 'requests/:id', component: ProviderRequestDetailComponent }
];

@NgModule({
    declarations: [
        HomeCareSidebarComponent,
        HomeCareTopbarComponent,
        HomeCareDashboardComponent,
        ProviderAvailabilityComponent,
        ProviderDashboardComponent,
        ProviderRequestDetailComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes)
    ]
})
export class HomeCareModule { }
