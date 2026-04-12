import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopbarComponent } from './topbar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, BehaviorSubject } from 'rxjs';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { NotificationService } from '../../../../../services/notification.service';
import { DeliveryTrackingService } from '../../../../../services/delivery-tracking.service';
import { Router } from '@angular/router';

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let fixture: ComponentFixture<TopbarComponent>;
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

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TopbarComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: DeliveryTrackingService, useValue: deliveryTrackingServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user info on init', () => {
    expect(authServiceSpy.getUserFullName).toHaveBeenCalled();
    expect(component.firstName).toBe('Patient');
  });

  it('should disconnect from delivery tracking on destroy', () => {
    component.ngOnDestroy();
    expect(deliveryTrackingServiceSpy.disconnect).toHaveBeenCalled();
  });
});
