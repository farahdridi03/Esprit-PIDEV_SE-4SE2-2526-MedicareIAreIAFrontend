import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';
import { EventDetailComponent } from './features/front-office/patient/pages/event-detail/event-detail.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'front/events/:id',
    component: EventDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'front',
    loadChildren: () =>
      import('./features/front-office/front-office.module')
        .then(m => m.FrontOfficeModule)
  },


  {
    path: 'admin',
    loadChildren: () =>
      import('./features/back-office/back-office.module')
        .then(m => m.BackOfficeModule)
  },

  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module')
        .then(m => m.AuthModule)
  },
  {
    path: 'pharmacist',
    loadChildren: () =>
      import('./features/pharmacist/pharmacist.module')
        .then(m => m.PharmacistModule)
  },
  {
    path: 'verify-code',
    canActivate: [
      (route: any) => {
        const router = inject(Router);
        return router.createUrlTree(['/auth/verify-code'], { queryParams: route.queryParams });
      }
    ],
    // The component is required for the route to be structurally valid, but we inject a redirect first.
    // Actually in modern Angular a route doesn't strictly need a component if we redirect via guard.
    // To be safe we'll provide a dummy empty children array.
    children: []
  },

  {
    path: '',
    redirectTo: 'front',
    pathMatch: 'full'
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
