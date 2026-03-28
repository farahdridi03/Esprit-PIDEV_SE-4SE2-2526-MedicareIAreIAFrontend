import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Component Imports
import { HomeCareSidebarComponent } from './components/home-care-sidebar/home-care-sidebar.component';
import { HomeCareTopbarComponent } from './components/home-care-topbar/home-care-topbar.component';
import { HomeCareDashboardComponent } from './pages/home-care-dashboard/home-care-dashboard.component';
import { ProviderDashboardComponent } from './pages/provider-dashboard/provider-dashboard.component';
import { ProviderAvailabilityComponent } from './pages/provider-availability/provider-availability.component';
import { ProviderRequestDetailComponent } from './pages/provider-request-detail/provider-request-detail.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'provider-dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        component: HomeCareDashboardComponent
    },
    {
        path: 'provider-dashboard',
        component: HomeCareDashboardComponent
    },
    {
        path: 'availability',
        component: ProviderAvailabilityComponent
    },
    {
        path: 'requests',
        component: ProviderDashboardComponent
    },
    {
        path: 'requests/:id',
        component: ProviderRequestDetailComponent
    }
];

@NgModule({
    declarations: [
        HomeCareSidebarComponent,
        HomeCareTopbarComponent,
        HomeCareDashboardComponent,
        ProviderDashboardComponent,
        ProviderAvailabilityComponent,
        ProviderRequestDetailComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes)
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeCareModule { }
