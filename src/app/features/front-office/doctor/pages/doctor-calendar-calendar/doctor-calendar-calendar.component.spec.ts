import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { DoctorCalendarCalendarComponent } from './doctor-calendar-calendar.component';
import { ScheduleService } from '../../../../../services/schedule.service';
import { AuthService } from '../../../../../services/auth.service';
import { AvailabilityService } from '../../../../../services/availability.service';

describe('DoctorCalendarCalendarComponent', () => {
  let component: DoctorCalendarCalendarComponent;
  let fixture: ComponentFixture<DoctorCalendarCalendarComponent>;
  let scheduleServiceSpy: jasmine.SpyObj<ScheduleService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let availabilityServiceSpy: jasmine.SpyObj<AvailabilityService>;

  const mockAvailabilities = [
    { 
      id: 1, 
      startTime: [2026, 3, 30, 9, 0], // Jackson array: Monday, March 30, 2026
      endTime: [2026, 3, 30, 10, 0],
      mode: 'ONLINE',
      status: 'AVAILABLE'
    },
    { 
      id: 2, 
      startTime: '2026-03-31T11:00:00', // String format: Tuesday
      endTime: '2026-03-31T12:00:00',
      mode: 'OFFICE',
      status: 'AVAILABLE'
    }
  ];

  const mockPreviewSchedule = {
    providerId: 1,
    days: [
      { dayOfWeek: 'MONDAY', active: true, timeSlots: [{ startTime: '09:00', endTime: '12:00', mode: 'ONLINE' }] }
    ]
  };

  beforeEach(async () => {
    const scheduleSpy = jasmine.createSpyObj('ScheduleService', ['getExceptions']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getUserId']);
    const availabilitySpy = jasmine.createSpyObj('AvailabilityService', ['getAvailabilitiesByDoctor']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [DoctorCalendarCalendarComponent],
      providers: [
        { provide: ScheduleService, useValue: scheduleSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: AvailabilityService, useValue: availabilitySpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    scheduleServiceSpy = TestBed.inject(ScheduleService) as jasmine.SpyObj<ScheduleService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    availabilityServiceSpy = TestBed.inject(AvailabilityService) as jasmine.SpyObj<AvailabilityService>;
  });

  beforeEach(() => {
    authServiceSpy.getUserId.and.returnValue(1);
    availabilityServiceSpy.getAvailabilitiesByDoctor.and.returnValue(of(mockAvailabilities as any[]));
    
    fixture = TestBed.createComponent(DoctorCalendarCalendarComponent);
    component = fixture.componentInstance;
    component.selectedDate = new Date(2026, 2, 30); // Monday, March 30, 2026
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize and load schedule in non-preview mode', () => {
    component.isPreview = false;
    fixture.detectChanges();
    expect(availabilityServiceSpy.getAvailabilitiesByDoctor).toHaveBeenCalledWith(1);
    expect(component.availabilities.length).toBe(2);
  });

  it('should use previewSchedule in preview mode', () => {
    component.isPreview = true;
    component.previewSchedule = mockPreviewSchedule as any;
    fixture.detectChanges();
    expect(component.weeklySchedule).toEqual(mockPreviewSchedule as any);
    expect(availabilityServiceSpy.getAvailabilitiesByDoctor).not.toHaveBeenCalled();
  });

  it('should correctly parsing Jackson array date/time in getDaySchedule', () => {
    component.isPreview = false;
    fixture.detectChanges();
    
    const monday = new Date(2026, 2, 30);
    const schedule = component.getDaySchedule(monday);
    
    expect(schedule?.active).toBeTrue();
    expect(schedule?.timeSlots.length).toBe(1);
    expect(schedule?.timeSlots[0].startTime).toBe('09:00');
  });

  it('should correctly parsing ISO string date/time in getDaySchedule', () => {
    component.isPreview = false;
    fixture.detectChanges();
    
    const tuesday = new Date(2026, 2, 31);
    const schedule = component.getDaySchedule(tuesday);
    
    expect(schedule?.active).toBeTrue();
    expect(schedule?.timeSlots.length).toBe(1);
    expect(schedule?.timeSlots[0].startTime).toBe('11:00');
  });

  it('should return inactive schedule if no slots on that day', () => {
    component.isPreview = false;
    fixture.detectChanges();
    
    const wednesday = new Date(2026, 3, 1);
    const schedule = component.getDaySchedule(wednesday);
    expect(schedule?.active).toBeFalse();
  });

  it('should correctly map template in preview mode', () => {
    component.isPreview = true;
    component.previewSchedule = mockPreviewSchedule as any;
    fixture.detectChanges();
    
    const monday = new Date(2026, 2, 30);
    const schedule = component.getDaySchedule(monday);
    expect(schedule?.dayOfWeek).toBe('MONDAY');
    expect(schedule?.timeSlots[0].mode).toBe('ONLINE');
  });

  it('should calculate isToday correctly', () => {
    const today = new Date();
    expect(component.isToday(today)).toBeTrue();
    
    const past = new Date(2000, 0, 1);
    expect(component.isToday(past)).toBeFalse();
  });

  it('should navigate weeks', () => {
    fixture.detectChanges();
    const initialMonday = new Date(component.daysInWeek[0]);
    
    component.nextWeek();
    expect(component.daysInWeek[0].getTime()).toBeGreaterThan(initialMonday.getTime());
    
    component.prevWeek();
    expect(component.daysInWeek[0].getTime()).toBe(initialMonday.getTime());
  });
});
