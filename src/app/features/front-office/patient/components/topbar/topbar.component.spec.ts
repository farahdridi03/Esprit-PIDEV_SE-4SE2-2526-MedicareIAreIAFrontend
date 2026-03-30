import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopbarComponent } from './topbar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../../../../../services/auth.service';
import { UserService } from '../../../../../services/user.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let fixture: ComponentFixture<TopbarComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  const mockUser = { fullName: 'Sarah Martin', email: 'sarah@example.com' };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getUserFullName', 'getUserId']);
    const userSpy = jasmine.createSpyObj('UserService', ['getProfile']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TopbarComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: userSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  beforeEach(() => {
    authServiceSpy.getUserFullName.and.returnValue('Auth User');
    userServiceSpy.getProfile.and.returnValue(of(mockUser));

    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

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
  });
});
