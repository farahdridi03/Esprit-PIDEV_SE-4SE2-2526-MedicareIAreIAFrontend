import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', ['getProfile']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserFullName']);

    mockUserService.getProfile.and.returnValue(of({ fullName: 'John Patient' } as any));
    mockAuthService.getUserFullName.and.returnValue('Jane Patient');

    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [DashboardComponent],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

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
  });
});
