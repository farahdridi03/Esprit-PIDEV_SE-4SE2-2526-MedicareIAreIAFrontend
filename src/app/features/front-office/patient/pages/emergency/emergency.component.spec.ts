import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmergencyComponent } from './emergency.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { EmergencyService } from '../../../../../services/emergency.service';
import { AuthService } from '../../../../../services/auth.service';
import { FormsModule } from '@angular/forms';

describe('EmergencyComponent', () => {
  let component: EmergencyComponent;
  let fixture: ComponentFixture<EmergencyComponent>;
  let emergencyServiceMock: any;
  let authServiceMock: any;

  beforeEach(async () => {
    emergencyServiceMock = {
      getAllAlerts: jasmine.createSpy('getAllAlerts').and.returnValue(of([])),
      createAlert: jasmine.createSpy('createAlert').and.returnValue(of({})),
      cancelAlert: jasmine.createSpy('cancelAlert').and.returnValue(of({}))
    };

    authServiceMock = {
      getUserFullName: jasmine.createSpy('getUserFullName').and.returnValue('Test User')
    };

    await TestBed.configureTestingModule({
      declarations: [EmergencyComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule
      ],
      providers: [
        { provide: EmergencyService, useValue: emergencyServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(EmergencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load alerts on init', () => {
    expect(emergencyServiceMock.getAllAlerts).toHaveBeenCalled();
  });

  it('should identitfy if the current user is the creator of the alert', () => {
    component.currentUserFullName = 'Test User';
    expect(component.isCreator('Test User')).toBeTrue();
    expect(component.isCreator('Another User')).toBeFalse();
  });

  it('should show correct severity icon', () => {
    expect(component.getSeverityIcon('CRITICAL')).toBe('🚨');
    expect(component.getSeverityIcon('HIGH')).toBe('⚠️');
    expect(component.getSeverityIcon('MEDIUM')).toBe('🔔');
    expect(component.getSeverityIcon('LOW')).toBe('💡');
  });
});
