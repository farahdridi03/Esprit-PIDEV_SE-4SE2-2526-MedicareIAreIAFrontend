import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of, throwError } from 'rxjs';

import { TopbarComponent } from './topbar.component';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let fixture: ComponentFixture<TopbarComponent>;
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
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial names from authService', () => {
    expect(mockAuthService.getUserFullName).toHaveBeenCalled();
  });

  it('should update names from userService profile', () => {
    expect(mockUserService.getProfile).toHaveBeenCalled();
    expect(component.firstName).toBe('John');
    expect(component.initials).toBe('JD');
  });

  it('should handle profile fetch error', () => {
    mockUserService.getProfile.and.returnValue(throwError(() => new Error('API Error')));
    component.ngOnInit();
    expect(component.firstName).toBe('Jane');
  });
});
