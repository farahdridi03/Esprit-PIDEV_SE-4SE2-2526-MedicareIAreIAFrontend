import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
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

  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module')
        .then(m => m.AuthModule)
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
