import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorTopbarComponent } from './doctor-topbar.component';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DoctorTopbarComponent', () => {
  let component: DoctorTopbarComponent;
  let fixture: ComponentFixture<DoctorTopbarComponent>;
  let mockUserService: any;
  let mockAuthService: any;

  beforeEach(async () => {
    mockUserService = {
      getProfile: jasmine.createSpy('getProfile').and.returnValue(of({ fullName: 'Dr. Gregory House' }))
    };

    mockAuthService = {
      getUserFullName: jasmine.createSpy('getUserFullName').and.returnValue('Dr House')
    };

    await TestBed.configureTestingModule({
      declarations: [ DoctorTopbarComponent ],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorTopbarComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should update initials and name on load from AuthService', () => {
    // Make UserService return nothing for this test to verify AuthService fallback
    mockUserService.getProfile.and.returnValue(of(null));
    fixture.detectChanges();
    expect(mockAuthService.getUserFullName).toHaveBeenCalled();
    // Gets from AuthService ('Dr House')
    expect(component.firstName).toBe('Dr');
    expect(component.initials).toBe('DH');
  });

  it('should update names from UserService if available after init', () => {
    mockUserService.getProfile.and.returnValue(of({ fullName: 'Gregory House' }));
    fixture.detectChanges();
    expect(component.firstName).toBe('Gregory');
    expect(component.initials).toBe('GH');
  });

  it('should handle multiple name initials correctly', () => {
    fixture.detectChanges();
    (component as any).setNames('Gregory James House');
    expect(component.initials).toBe('GJH');
  });

  it('should handle single name correctly', () => {
    fixture.detectChanges();
    (component as any).setNames('House');
    expect(component.initials).toBe('H');
  });
});
