import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminTopbarComponent } from './admin-topbar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationService } from '../../../services/notification.service';
import { EventService } from '../../../services/event.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { of } from 'rxjs';
import { Notification } from '../../../models/notification.model';

describe('AdminTopbarComponent', () => {
  let component: AdminTopbarComponent;
  let fixture: ComponentFixture<AdminTopbarComponent>;
  let notifService: jasmine.SpyObj<NotificationService>;
  let eventService: jasmine.SpyObj<EventService>;
  let userService: jasmine.SpyObj<UserService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const notifSpy = jasmine.createSpyObj('NotificationService', ['getNotifications', 'markAsRead', 'markAllRead', 'deleteNotification', 'clearAll']);
    const eventSpy = jasmine.createSpyObj('EventService', ['acceptParticipation', 'rejectParticipation']);
    const userSpy = jasmine.createSpyObj('UserService', ['getProfile']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getUserFullName']);

    // Default mock returns
    userSpy.getProfile.and.returnValue(of({ fullName: 'Admin User' }));
    authSpy.getUserFullName.and.returnValue('Admin User');
    notifSpy.getNotifications.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [ AdminTopbarComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      providers: [
        { provide: NotificationService, useValue: notifSpy },
        { provide: EventService, useValue: eventSpy },
        { provide: UserService, useValue: userSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTopbarComponent);
    component = fixture.componentInstance;
    notifService = TestBed.get(NotificationService);
    eventService = TestBed.get(EventService);
    userService = TestBed.get(UserService);
    authService = TestBed.get(AuthService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call deleteNotification and update local state', () => {
    const mockId = 1;
    component.notifications = [
        { id: mockId, message: 'Test Notif', isRead: false } as Notification
    ];
    notifService.deleteNotification.and.returnValue(of({}));
    
    component.deleteNotification(mockId, new MouseEvent('click'));
    
    expect(notifService.deleteNotification).toHaveBeenCalledWith(mockId);
    expect(component.notifications.length).toBe(0);
  });

  it('should call clearAll and clear local notifications', () => {
    component.notifications = [ { id: 1 } as Notification, { id: 2 } as Notification ];
    notifService.clearAll.and.returnValue(of({}));
    
    component.clearAll();
    
    expect(notifService.clearAll).toHaveBeenCalled();
    expect(component.notifications.length).toBe(0);
  });
});
