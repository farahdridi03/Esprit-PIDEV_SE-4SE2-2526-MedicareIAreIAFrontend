import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClinicDashboardComponent } from './clinic-dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { AmbulanceService } from '../../../../../services/ambulance.service';
import { EmergencyService } from '../../../../../services/emergency.service';
import { AuthService } from '../../../../../services/auth.service';
import { UserService } from '../../../../../services/user.service';
import { of } from 'rxjs';

describe('ClinicDashboardComponent', () => {
  let component: ClinicDashboardComponent;
  let fixture: ComponentFixture<ClinicDashboardComponent>;
  
  let ambulanceServiceMock: any;
  let emergencyServiceMock: any;
  let authServiceMock: any;
  let userServiceMock: any;

  beforeEach(async () => {
    ambulanceServiceMock = {
      getByClinic: jasmine.createSpy('getByClinic').and.returnValue(of([]))
    };

    emergencyServiceMock = {
      getAllAlerts: jasmine.createSpy('getAllAlerts').and.returnValue(of([]))
    };

    authServiceMock = {
      getUserFullName: jasmine.createSpy('getUserFullName').and.returnValue('Clinic Admin'),
      getUserId: jasmine.createSpy('getUserId').and.returnValue(1)
    };

    userServiceMock = {
      getProfile: jasmine.createSpy('getProfile').and.returnValue(of({ fullName: 'Main Clinic' }))
    };

    await TestBed.configureTestingModule({
      declarations: [ClinicDashboardComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AmbulanceService, useValue: ambulanceServiceMock },
        { provide: EmergencyService, useValue: emergencyServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserService, useValue: userServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClinicDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial data', () => {
    expect(authServiceMock.getUserFullName).toHaveBeenCalled();
    expect(userServiceMock.getProfile).toHaveBeenCalled();
    expect(emergencyServiceMock.getAllAlerts).toHaveBeenCalled();
    expect(ambulanceServiceMock.getByClinic).toHaveBeenCalledWith(1);
  });

  it('should format names correctly', () => {
    expect(component.firstName).toBe('Main');
    expect(component.initials).toBe('MC');
  });

  it('should calculate ambulances with GPS count', () => {
    component.ambulances = [
      { id: 1, currentLat: 10, currentLng: 20 } as any,
      { id: 2 } as any
    ];
    expect(component.ambulancesWithGpsCount).toBe(1);
  });

  it('should get correct severity icon', () => {
    expect(component.getSeverityIcon('CRITICAL')).toBe('🚨');
    expect(component.getSeverityIcon('HIGH')).toBe('⚠️');
    expect(component.getSeverityIcon('MEDIUM')).toBe('🔔');
    expect(component.getSeverityIcon('LOW')).toBe('💡');
  });

  it('should format date', () => {
    const formatted = component.formatDate('2026-03-28T12:00:00Z');
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });
});
