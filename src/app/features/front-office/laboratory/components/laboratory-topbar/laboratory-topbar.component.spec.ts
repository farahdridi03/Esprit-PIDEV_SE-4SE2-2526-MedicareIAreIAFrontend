import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LaboratoryStaffTopbarComponent } from './laboratory-topbar.component';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { of, throwError } from 'rxjs';

describe('LaboratoryStaffTopbarComponent', () => {
  let component: LaboratoryStaffTopbarComponent;
  let fixture: ComponentFixture<LaboratoryStaffTopbarComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', ['getProfile']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserFullName']);

    await TestBed.configureTestingModule({
      declarations: [ LaboratoryStaffTopbarComponent ],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LaboratoryStaffTopbarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user info from token on init', () => {
    mockAuthService.getUserFullName.and.returnValue('Alice Wonderland');
    mockUserService.getProfile.and.returnValue(of({} as any)); // no full name
    
    fixture.detectChanges(); // calls ngOnInit
    
    expect(component.firstName).toBe('Alice');
    expect(component.initials).toBe('AW');
  });

  it('should set names correctly from profile fetch', () => {
    mockAuthService.getUserFullName.and.returnValue(null);
    mockUserService.getProfile.and.returnValue(of({ fullName: 'Bob Builder' } as any));
    
    fixture.detectChanges();
    
    expect(component.firstName).toBe('Bob');
    expect(component.initials).toBe('BB');
  });

  it('should handle single name format', () => {
    mockAuthService.getUserFullName.and.returnValue('Charlie');
    mockUserService.getProfile.and.returnValue(throwError(() => new Error('Error')));
    
    fixture.detectChanges();
    
    expect(component.firstName).toBe('Charlie');
    expect(component.initials).toBe('C');
  });
});
