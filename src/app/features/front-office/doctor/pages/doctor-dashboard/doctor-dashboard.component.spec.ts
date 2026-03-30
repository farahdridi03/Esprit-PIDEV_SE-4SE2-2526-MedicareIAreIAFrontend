import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DoctorDashboardComponent } from './doctor-dashboard.component';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';
import { AppointmentService } from '../../../../../services/appointment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DoctorDashboardComponent', () => {
  let component: DoctorDashboardComponent;
  let fixture: ComponentFixture<DoctorDashboardComponent>;
  
  // Mocks
  let mockAuthService: any;
  let mockAppointmentService: any;
  let mockActivatedRoute: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = {
      getUserFullName: jasmine.createSpy('getUserFullName').and.returnValue('Dr. House'),
      getUserId: jasmine.createSpy('getUserId').and.returnValue(1)
    };

    mockAppointmentService = {
      getDoctorAppointments: jasmine.createSpy('getDoctorAppointments').and.returnValue(of([]))
    };

    mockActivatedRoute = {
      queryParams: of({ view: 'overview' })
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      declarations: [ DoctorDashboardComponent ],
      providers: [
        { provide: ChangeDetectorRef, useValue: { detectChanges: () => {} } },
        { provide: AuthService, useValue: mockAuthService },
        { provide: AppointmentService, useValue: mockAppointmentService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should extract first name correctly from full name with "Dr." prefix', () => {
    // Already set in beforeEach as 'Dr. House'
    expect(component.firstName).toBe('House');
  });

  it('should load dashboard data on init', () => {
    expect(mockAuthService.getUserId).toHaveBeenCalled();
    expect(mockAppointmentService.getDoctorAppointments).toHaveBeenCalled();
  });

  it('should switch views and update the router', () => {
    component.setView('calendar');
    expect(component.currentView).toBe('calendar');
    expect(mockRouter.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { view: 'calendar' }
    }));
  });

  it('should generate calendar days on load', () => {
    // Mock some appointments
    const mockAppts: any[] = [
      { id: 1, date: '2026-03-29', patientId: 101, status: 'BOOKED', startTime: '10:00', endTime: '11:00', mode: 'ONLINE', doctorId: 1 }
    ];
    mockAppointmentService.getDoctorAppointments.and.returnValue(of(mockAppts));
    
    component.loadDashboardData(1);
    
    expect(component.calendarDays.length).toBeGreaterThan(0);
    expect(component.totalPatientsCount).toBe(1);
  });

  it('should navigate to next and previous months', () => {
    const initialMonth = component.calendarDate.getMonth();
    
    component.nextMonth();
    expect(component.calendarDate.getMonth()).toBe((initialMonth + 1) % 12);
    
    component.prevMonth();
    expect(component.calendarDate.getMonth()).toBe(initialMonth);
  });

  it('should calculate pending and live counts correctly', () => {
    component.todayAppointments = [
      { id: 1, status: 'BOOKED', patientId: 1, date: '', startTime: '10:00', endTime: '11:00', mode: 'ONLINE', doctorId: 1 },
      { id: 2, status: 'LIVE', patientId: 2, date: '', startTime: '11:00', endTime: '12:00', mode: 'ONLINE', doctorId: 1 },
      { id: 3, status: 'COMPLETED', patientId: 3, date: '', startTime: '12:00', endTime: '13:00', mode: 'ONLINE', doctorId: 1 }
    ] as any;

    expect(component.getPendingCount()).toBe(1);
    expect(component.getLiveCount()).toBe(1);
  });

  it('should update selected date and reload data when a day is selected', () => {
    const newDate = '2026-04-01';
    component.selectDay(newDate);
    
    expect(component.selectedDateStr).toBe(newDate);
    // Twice: once in ngOnInit (today) and once in selectDay
    expect(mockAppointmentService.getDoctorAppointments).toHaveBeenCalledTimes(4); // 2 per load (today + stats)
  });
});
