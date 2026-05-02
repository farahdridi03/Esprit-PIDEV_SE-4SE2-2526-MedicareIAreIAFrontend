import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PharmacistDashboardComponent } from './pages/pharmacist-dashboard/pharmacist-dashboard.component';
import { AuthGuard } from '../../../guards/auth.guard';
import { EventsDiscoveryComponent } from '../pages/events/events-discovery/events-discovery.component';
import { EventDetailComponent } from '../patient/pages/event-detail/event-detail.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: PharmacistDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PHARMACIST'] }
  },
  {
    path: 'events',
    component: EventsDiscoveryComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PHARMACIST'] }
  },
  {
    path: 'events/:id',
    component: EventDetailComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PHARMACIST'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PharmacistRoutingModule { }
