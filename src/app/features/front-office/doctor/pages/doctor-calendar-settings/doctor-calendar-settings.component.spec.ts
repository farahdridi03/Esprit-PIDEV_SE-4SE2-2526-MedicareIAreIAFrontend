import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormArray } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { DoctorCalendarSettingsComponent } from './doctor-calendar-settings.component';
import { ScheduleService } from '../../../../../services/schedule.service';
import { AvailabilityService } from '../../../../../services/availability.service';
import { AuthService } from '../../../../../services/auth.service';

describe('DoctorCalendarSettingsComponent', () => {
  let component: DoctorCalendarSettingsComponent;
  let fixture: ComponentFixture<DoctorCalendarSettingsComponent>;
  let scheduleServiceSpy: jasmine.SpyObj<ScheduleService>;
  let availabilityServiceSpy: jasmine.SpyObj<AvailabilityService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockExceptions = [
    { 
      startDate: '2026-03-30', // A Monday
      reason: 'Semaine Spécifique',
      isAvailable: true,
      timeSlots: [{ startTime: '08:00', endTime: '12:00', mode: 'ONLINE' }]
    }
  ];

  beforeEach(async () => {
    const scheduleSpy = jasmine.createSpyObj('ScheduleService', ['getExceptions', 'saveSpecificWeek']);
    const availabilitySpy = jasmine.createSpyObj('AvailabilityService', ['getAvailabilitiesByDoctor']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getUserId']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      declarations: [DoctorCalendarSettingsComponent],
      providers: [
        { provide: ScheduleService, useValue: scheduleSpy },
        { provide: AvailabilityService, useValue: availabilitySpy },
        { provide: AuthService, useValue: authSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    scheduleServiceSpy = TestBed.inject(ScheduleService) as jasmine.SpyObj<ScheduleService>;
    availabilityServiceSpy = TestBed.inject(AvailabilityService) as jasmine.SpyObj<AvailabilityService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  beforeEach(() => {
    authServiceSpy.getUserId.and.returnValue(1);
    scheduleServiceSpy.getExceptions.and.returnValue(of(mockExceptions as any[]));
    availabilityServiceSpy.getAvailabilitiesByDoctor.and.returnValue(of([]));
    
    // Set a fixed base date for predictability (March 30, 2026 is a Monday)
    const baseDate = new Date(2026, 2, 30); 
    
    fixture = TestBed.createComponent(DoctorCalendarSettingsComponent);
    component = fixture.componentInstance;
    component.selectedDate = baseDate;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize form with 7 days', () => {
    fixture.detectChanges();
    expect(component.days.length).toBe(7);
  });

  it('should populate form with existing exceptions', () => {
    fixture.detectChanges();
    // Monday (index 0) should be active based on mockExceptions
    const monday = component.days.at(0);
    expect(monday.get('active')?.value).toBeTrue();
    expect(component.timeSlots(0).length).toBe(1);
    expect(component.timeSlots(0).at(0).get('startTime')?.value).toBe('08:00');
  });

  it('should add and remove time slots', () => {
    fixture.detectChanges();
    component.addTimeSlot(0);
    expect(component.timeSlots(0).length).toBe(2);
    
    component.removeTimeSlot(0, 0);
    expect(component.timeSlots(0).length).toBe(1);
  });

  it('should toggle day active state', () => {
    fixture.detectChanges();
    const initialValue = component.days.at(1).get('active')?.value;
    component.toggleDay(1);
    expect(component.days.at(1).get('active')?.value).toBe(!initialValue);
  });

  it('should navigate weeks', () => {
    fixture.detectChanges();
    const initialMonday = new Date(component.daysInWeek[0]);
    
    component.nextWeek();
    expect(component.daysInWeek[0].getTime()).toBeGreaterThan(initialMonday.getTime());
    expect(component.daysInWeek[0].getDate()).not.toBe(initialMonday.getDate());
    
    component.prevWeek();
    expect(component.daysInWeek[0].getTime()).toBe(initialMonday.getTime());
  });

  it('should save schedule successfully and emit event', fakeAsync(() => {
    fixture.detectChanges();
    scheduleServiceSpy.saveSpecificWeek.and.returnValue(of({ success: true } as any));
    const emitSpy = spyOn(component.navigateToCalendar, 'emit');
    
    // Activate a day to have something to save
    component.days.at(0).get('active')?.setValue(true);
    
    component.saveSchedule();
    
    expect(scheduleServiceSpy.saveSpecificWeek).toHaveBeenCalled();
    expect(component.successMessage).toContain('saved');
    
    tick(1500); // Wait for timeout
    expect(emitSpy).toHaveBeenCalled();
  }));

  it('should handle save error', () => {
    fixture.detectChanges();
    scheduleServiceSpy.saveSpecificWeek.and.returnValue(throwError(() => new Error('Save error')));
    
    component.days.at(0).get('active')?.setValue(true);
    component.saveSchedule();
    
    expect(component.errorMessage).toBe('An error occurred while saving. Please check the server console for errors.');
    expect(component.isSaving).toBeFalse();
  });

  describe('Utility Methods', () => {
    it('should format date to YYYY-MM-DD', () => {
      fixture.detectChanges();
      const testDate = new Date(2026, 0, 15); // Jan 15, 2026
      expect(component.formatDateStr(testDate)).toBe('2026-01-15');
    });

    it('should get correct date for a given day name', () => {
      fixture.detectChanges();
      // component.daysInWeek[0] is March 30, 2026 (Monday)
      const mondayDate = component.getDateForDay('MONDAY');
      expect(mondayDate?.getDate()).toBe(30);
      expect(mondayDate?.getMonth()).toBe(2); // March
    });
  });
});
