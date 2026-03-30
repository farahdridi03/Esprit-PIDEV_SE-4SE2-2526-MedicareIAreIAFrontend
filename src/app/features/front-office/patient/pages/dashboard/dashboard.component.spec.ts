
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { of, throwError } from 'rxjs';


import { DashboardComponent } from './dashboard.component';
<<<<<<< HEAD
import { AuthService } from '../../../../../services/auth.service';
import { UserService } from '../../../../../services/user.service';
import { AppointmentService } from '../../../../../services/appointment.service';
import { AppointmentDTO } from '../../../../../models/appointment.model';
=======
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
>>>>>>> origin/frontVersion1

describe('DashboardComponent', () => {

  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
<<<<<<< HEAD
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let appointmentServiceSpy: jasmine.SpyObj<AppointmentService>;

  const mockUser = { fullName: 'Sarah Martin', email: 'sarah@example.com' };
  const mockAppointments: any[] = [
    { id: 1, date: '2100-01-01', startTime: '10:00', status: 'CONFIRMED', mode: 'ONLINE', doctorName: 'Dr. House' },
    { id: 2, date: '2020-01-01', startTime: '09:00', status: 'COMPLETED', mode: 'OFFICE', doctorName: 'Dr. Grey' },
    { id: 3, date: '2100-02-01', startTime: '11:00', status: 'BOOKED',    mode: 'ONLINE', doctorName: 'Dr. House' }
  ];

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getUserFullName', 'getUserId']);
    const userSpy = jasmine.createSpyObj('UserService', ['getProfile']);
    const apptSpy = jasmine.createSpyObj('AppointmentService', ['getPatientAppointments']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: userSpy },
        { provide: AppointmentService, useValue: apptSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    appointmentServiceSpy = TestBed.inject(AppointmentService) as jasmine.SpyObj<AppointmentService>;
  });

  beforeEach(() => {
    authServiceSpy.getUserFullName.and.returnValue('Auth User');
    authServiceSpy.getUserId.and.returnValue(1);
    userServiceSpy.getProfile.and.returnValue(of(mockUser));
    appointmentServiceSpy.getPatientAppointments.and.returnValue(of(mockAppointments));

=======
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', ['getProfile']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserFullName']);

    mockUserService.getProfile.and.returnValue(of({ fullName: 'John Patient' } as any));
    mockAuthService.getUserFullName.and.returnValue('Jane Patient');

    await TestBed.configureTestingModule({

      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [DashboardComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]

    })
    .compileComponents();
>>>>>>> origin/frontVersion1

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

<<<<<<< HEAD
  it('should initialize firstName from AuthService first, then UserService', () => {
    // Before userService returns: (OnInit start)
    fixture.detectChanges();
    // After userService returns: (Subscribed on Init)
    expect(component.firstName).toBe('Sarah'); // Split 'Sarah Martin'
  });

  it('should handle error when fetching user profile', () => {
    userServiceSpy.getProfile.and.returnValue(throwError(() => new Error('Error')));
    fixture.detectChanges();
    expect(component.firstName).toBe('Auth'); // Fallback to AuthService split 'Auth User'
  });

  it('should calculate active appointmentCount correctly', () => {
    fixture.detectChanges();
    // mockAppointments has 1 CONFIRMED and 1 BOOKED = 2
    expect(component.appointmentCount).toBe(2);
  });

  it('should identify the earliest next appointment correctly', () => {
    fixture.detectChanges();
    expect(component.nextAppointment).toBeTruthy();
    expect(component.nextAppointment?.id).toBe(1); // 2100-01-01 is earlier than 2100-02-01
  });

  it('should handle dashboard with no upcoming appointments', () => {
    appointmentServiceSpy.getPatientAppointments.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component.nextAppointment).toBeNull();
    expect(component.appointmentCount).toBe(0);
=======
  it('should load first name from authService initially', () => {
    // ngOnInit split the fullName and use the first part
    expect(mockAuthService.getUserFullName).toHaveBeenCalled();
  });

  it('should update name from userService profile', () => {
    expect(mockUserService.getProfile).toHaveBeenCalled();
    expect(component.firstName).toBe('John'); 
  });

  it('should use auth name if profile fails', () => {
    mockUserService.getProfile.and.returnValue(throwError(() => new Error('Error')));
    component.ngOnInit();
    expect(component.firstName).toBe('Jane'); // From AuthService mock return 'Jane Patient'
>>>>>>> origin/frontVersion1
  });
});
