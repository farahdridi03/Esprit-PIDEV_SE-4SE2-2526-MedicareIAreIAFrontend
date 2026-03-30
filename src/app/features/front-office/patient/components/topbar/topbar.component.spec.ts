import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TopbarComponent } from './topbar.component';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { NotificationService } from '../../../../../services/notification.service';
import { of } from 'rxjs';

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let fixture: ComponentFixture<TopbarComponent>;

  beforeEach(async () => {
    const userSpy = jasmine.createSpyObj('UserService', ['getProfile']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getUserFullName', 'getUserRole']);
    const notifSpy = jasmine.createSpyObj('NotificationService', ['getNotifications', 'markAsRead', 'markAllRead', 'deleteNotification', 'clearAll']);

    userSpy.getProfile.and.returnValue(of({ fullName: 'Patient User' }));
    authSpy.getUserFullName.and.returnValue('Patient User');
    notifSpy.getNotifications.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [TopbarComponent],
      providers: [
        { provide: UserService, useValue: userSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: NotificationService, useValue: notifSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
