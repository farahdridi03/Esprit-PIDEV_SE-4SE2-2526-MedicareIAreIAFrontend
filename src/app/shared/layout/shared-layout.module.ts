import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppLayoutComponent } from './app-layout.component';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from './admin-topbar/admin-topbar.component';

@NgModule({
  declarations: [
    AppLayoutComponent,
    AdminSidebarComponent,
    AdminTopbarComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    AppLayoutComponent,
    AdminSidebarComponent,
    AdminTopbarComponent
  ]
})
export class SharedLayoutModule { }
