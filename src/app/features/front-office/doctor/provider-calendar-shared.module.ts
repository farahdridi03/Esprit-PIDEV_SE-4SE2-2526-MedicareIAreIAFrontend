import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DoctorCalendarSettingsComponent } from './pages/doctor-calendar-settings/doctor-calendar-settings.component';
import { DoctorCalendarExceptionsComponent } from './pages/doctor-calendar-exceptions/doctor-calendar-exceptions.component';
import { DoctorCalendarCalendarComponent } from './pages/doctor-calendar-calendar/doctor-calendar-calendar.component';

@NgModule({
  declarations: [
    DoctorCalendarSettingsComponent,
    DoctorCalendarExceptionsComponent,
    DoctorCalendarCalendarComponent
  ],
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule
  ],
  exports: [
    DoctorCalendarSettingsComponent,
    DoctorCalendarExceptionsComponent,
    DoctorCalendarCalendarComponent
  ]
})
export class ProviderCalendarSharedModule { }
