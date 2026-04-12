import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DatePipe, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastComponent } from './components/toast/toast.component';
import { AlertsListComponent } from './features/front-office/pharmacist/pages/alerts-list/alerts-list.component';
import { EventDetailComponent } from './features/front-office/pages/event-detail/event-detail.component';
import { PatientEventsComponent } from './features/front-office/pages/patient-events/patient-events.component';

@NgModule({
  declarations: [
    AppComponent,
    ToastComponent,
    AlertsListComponent,
    EventDetailComponent,
    PatientEventsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    RouterModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
