import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { DoctorCalendarExceptionsComponent } from './doctor-calendar-exceptions.component';
import { ScheduleService } from '../../../../../services/schedule.service';
import { AuthService } from '../../../../../services/auth.service';
import { ScheduleException } from '../../../../../models/schedule.model';

describe('DoctorCalendarExceptionsComponent', () => {
  let component: DoctorCalendarExceptionsComponent;
  let fixture: ComponentFixture<DoctorCalendarExceptionsComponent>;
  let scheduleServiceSpy: jasmine.SpyObj<ScheduleService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockExceptions: ScheduleException[] = [
    { id: 1, providerId: 1, startDate: '2026-04-01', endDate: '2026-04-05', type: 'TIME_OFF', reason: 'Vacation', isAvailable: false },
    { id: 2, providerId: 1, startDate: '2026-05-01', endDate: '2026-05-01', type: 'HOLIDAY', reason: 'Labor Day', isAvailable: false }
  ];

  beforeEach(async () => {
    const scheduleSpy = jasmine.createSpyObj('ScheduleService', ['getExceptions', 'addException', 'deleteException']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getUserId']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      declarations: [DoctorCalendarExceptionsComponent],
      providers: [
        { provide: ScheduleService, useValue: scheduleSpy },
        { provide: AuthService, useValue: authSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    scheduleServiceSpy = TestBed.inject(ScheduleService) as jasmine.SpyObj<ScheduleService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  beforeEach(() => {
    authServiceSpy.getUserId.and.returnValue(1);
    scheduleServiceSpy.getExceptions.and.returnValue(of(mockExceptions));

    fixture = TestBed.createComponent(DoctorCalendarExceptionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load exceptions on init', () => {
    fixture.detectChanges();
    expect(scheduleServiceSpy.getExceptions).toHaveBeenCalledWith(1);
    expect(component.exceptions.length).toBe(2);
  });

  it('should toggle form and reset state', () => {
    fixture.detectChanges();
    component.toggleForm();
    expect(component.showForm).toBeTrue();

    component.exceptionForm.patchValue({ reason: 'Test' });
    component.toggleForm();
    expect(component.showForm).toBeFalse();
    // After reset({ type: 'ABSENCE' }), reason should be null
    expect(component.exceptionForm.get('reason')?.value).toBeNull();
  });

  it('should add exception successfully', fakeAsync(() => {
    fixture.detectChanges();
    const newEx = { id: 3, providerId: 1, startDate: '2026-06-01', endDate: '2026-06-10', type: 'ABSENCE', reason: 'Sick Leave', isAvailable: false };
    scheduleServiceSpy.addException.and.returnValue(of(newEx as any));

    component.showForm = true;
    component.exceptionForm.patchValue({
      startDate: '2026-06-01',
      endDate: '2026-06-10',
      type: 'ABSENCE',
      reason: 'Sick Leave',
      isAvailable: false
    });

    component.addException();
    // Resolves both the observable and the setTimeout
    tick(3000);

    expect(scheduleServiceSpy.addException).toHaveBeenCalledWith(1, jasmine.objectContaining({
      reason: 'Sick Leave'
    }));
    expect(component.exceptions[0].id).toBe(3);
    expect(component.successMessage).toBe(''); // Cleared after 3000ms
    expect(component.showForm).toBeFalse();
  }));

  it('should handle validation error on add exception', () => {
    fixture.detectChanges();
    component.exceptionForm.patchValue({ reason: '' }); // Invalid
    component.addException();
    expect(scheduleServiceSpy.addException).not.toHaveBeenCalled();
  });

  it('should delete exception after confirmation', () => {
    fixture.detectChanges();
    spyOn(window, 'confirm').and.returnValue(true);
    scheduleServiceSpy.deleteException.and.returnValue(of(undefined));

    const initialCount = component.exceptions.length;
    component.deleteException(1);

    expect(scheduleServiceSpy.deleteException).toHaveBeenCalledWith(1, 1);
    expect(component.exceptions.length).toBe(initialCount - 1);
    expect(component.exceptions.find(e => e.id === 1)).toBeUndefined();
  });

  it('should not delete exception if not confirmed', () => {
    fixture.detectChanges();
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteException(1);
    expect(scheduleServiceSpy.deleteException).not.toHaveBeenCalled();
  });

  it('should return correct type labels', () => {
    expect(component.getExceptionTypeLabel('TIME_OFF')).toBe('Leave');
    expect(component.getExceptionTypeLabel('HOLIDAY')).toBe('Public Holiday');
    expect(component.getExceptionTypeLabel('ABSENCE')).toBe('Absence');
  });
});
