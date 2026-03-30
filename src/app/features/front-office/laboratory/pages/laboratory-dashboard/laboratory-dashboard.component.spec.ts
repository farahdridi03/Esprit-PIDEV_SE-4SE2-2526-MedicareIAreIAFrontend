import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LaboratoryStaffDashboardComponent } from './laboratory-dashboard.component';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { of, throwError } from 'rxjs';

describe('LaboratoryStaffDashboardComponent', () => {
  let component: LaboratoryStaffDashboardComponent;
  let fixture: ComponentFixture<LaboratoryStaffDashboardComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', ['getProfile']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserFullName']);

    await TestBed.configureTestingModule({
      declarations: [ LaboratoryStaffDashboardComponent ],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LaboratoryStaffDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch profile on init and set firstName correctly', () => {
    mockAuthService.getUserFullName.and.returnValue('John Doe');
    mockUserService.getProfile.and.returnValue(of({ fullName: 'Jane Doe' } as any));
    
    fixture.detectChanges(); // calls ngOnInit
    
    expect(component.firstName).toBe('Jane');
  });

  it('should use token full name if profile fetch fails', () => {
    mockAuthService.getUserFullName.and.returnValue('Alice Smith');
    mockUserService.getProfile.and.returnValue(throwError(() => new Error('Error')));
    
    fixture.detectChanges();
    
    expect(component.firstName).toBe('Alice');
  });
});
