import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { TestingModule } from '../../../../../testing/testing.module';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    userServiceMock = jasmine.createSpyObj('UserService', ['getProfile']);
    authServiceMock = jasmine.createSpyObj('AuthService', ['getUserFullName']);

    userServiceMock.getProfile.and.returnValue(of({ fullName: 'John Doe' } as any));
    authServiceMock.getUserFullName.and.returnValue('John Doe');

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [TestingModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
