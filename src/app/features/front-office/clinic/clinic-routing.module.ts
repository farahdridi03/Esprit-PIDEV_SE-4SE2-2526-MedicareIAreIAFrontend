import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClinicDashboardComponent } from './pages/clinic-dashboard/clinic-dashboard.component';
import { AuthGuard } from '../../../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: ClinicDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['CLINIC'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClinicRoutingModule { }
