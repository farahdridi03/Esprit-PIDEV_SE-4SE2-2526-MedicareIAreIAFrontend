
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
<<<<<<< HEAD
<<<<<<< HEAD
import { TopbarComponent } from './topbar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../../../../../services/auth.service';
import { UserService } from '../../../../../services/user.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
=======

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { of, throwError } from 'rxjs';


import { TopbarComponent } from './topbar.component';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
>>>>>>> origin/frontVersion1
=======
import { TopbarComponent } from './topbar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, BehaviorSubject } from 'rxjs';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { NotificationService } from '../../../../../services/notification.service';
import { DeliveryTrackingService } from '../../../../../services/delivery-tracking.service';
import { Router } from '@angular/router';
>>>>>>> aziz

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let fixture: ComponentFixture<TopbarComponent>;
<<<<<<< HEAD
<<<<<<< HEAD
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  const mockUser = { fullName: 'Sarah Martin', email: 'sarah@example.com' };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getUserFullName', 'getUserId']);
    const userSpy = jasmine.createSpyObj('UserService', ['getProfile']);
=======
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let deliveryTrackingServiceSpy: jasmine.SpyObj<DeliveryTrackingService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const notificationsSubject = new BehaviorSubject<any[]>([]);
  const unreadCountSubject = new BehaviorSubject<number>(0);

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['getProfile']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserId', 'getUserEmail', 'getUserFullName']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['getNotifications', 'markAsRead', 'markAllAsRead']);
    deliveryTrackingServiceSpy = jasmine.createSpyObj('DeliveryTrackingService', ['connectToUserNotifications', 'disconnect']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Setup default returns
    userServiceSpy.getProfile.and.returnValue(of({ fullName: 'Patient Test' } as any));
    authServiceSpy.getUserId.and.returnValue(1);
    authServiceSpy.getUserEmail.and.returnValue('patient@test.com');
    authServiceSpy.getUserFullName.and.returnValue('Patient Test');
    notificationServiceSpy.getNotifications.and.returnValue(of([]));
    
    // Notifications streams
    (notificationServiceSpy as any).notifications$ = notificationsSubject.asObservable();
    (notificationServiceSpy as any).unreadCount$ = unreadCountSubject.asObservable();
>>>>>>> aziz

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TopbarComponent],
      providers: [
<<<<<<< HEAD
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: userSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
=======
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', ['getProfile']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserFullName']);

    mockUserService.getProfile.and.returnValue(of({ fullName: 'John Doe' } as any));
    mockAuthService.getUserFullName.and.returnValue('Jane Doe');

    await TestBed.configureTestingModule({

      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [TopbarComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
>>>>>>> origin/frontVersion1
    })
    .compileComponents();
=======
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: DeliveryTrackingService, useValue: deliveryTrackingServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
>>>>>>> aziz

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  beforeEach(() => {
    authServiceSpy.getUserFullName.and.returnValue('Auth User');
    userServiceSpy.getProfile.and.returnValue(of(mockUser));

    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

<<<<<<< HEAD
<<<<<<< HEAD
  it('should initialize names from AuthService first, then UserService', () => {
    fixture.detectChanges();
    expect(component.firstName).toBe('Sarah'); 
    expect(component.initials).toBe('SM');
  });

  it('should set names correctly for complex names', () => {
    fixture.detectChanges();
    (component as any).setNames('Jean Philippe Dupont');
    expect(component.firstName).toBe('Jean');
    expect(component.initials).toBe('JPD');
  });

  it('should handle single name for initials', () => {
    fixture.detectChanges();
    (component as any).setNames('Marie');
    expect(component.firstName).toBe('Marie');
    expect(component.initials).toBe('M');
  });

  it('should handle empty names gracefully', () => {
    fixture.detectChanges();
    (component as any).setNames('');
    // Should not change existing if empty string passed
    expect(component.firstName).toBe('Sarah'); 
  });

  it('should handle error in UserService gracefully', () => {
    userServiceSpy.getProfile.and.returnValue(throwError(() => new Error('API Error')));
    fixture.detectChanges();
    // Falls back to AuthService name
    expect(component.firstName).toBe('Auth');
    expect(component.initials).toBe('AU');
=======
  it('should load initial names from authService', () => {
    expect(mockAuthService.getUserFullName).toHaveBeenCalled();
    // Since getProfile is mocked with 'of', it might have already overwritten these
    // but Jane was the initial value from loadUserInfo
  });

  it('should update names from userService profile', () => {
    expect(mockUserService.getProfile).toHaveBeenCalled();
    expect(component.firstName).toBe('John');
    expect(component.initials).toBe('JD');
  });

  it('should handle profile fetch error', () => {
    mockUserService.getProfile.and.returnValue(throwError(() => new Error('API Error')));
    component.ngOnInit();
    // Names should still be what was loaded from authService initially
    expect(component.firstName).toBe('Jane');
>>>>>>> origin/frontVersion1
=======
  it('should load user info on init', () => {
    expect(authServiceSpy.getUserFullName).toHaveBeenCalled();
    expect(component.firstName).toBe('Patient');
  });

  it('should disconnect from delivery tracking on destroy', () => {
    component.ngOnDestroy();
    expect(deliveryTrackingServiceSpy.disconnect).toHaveBeenCalled();
>>>>>>> aziz
  });
});
