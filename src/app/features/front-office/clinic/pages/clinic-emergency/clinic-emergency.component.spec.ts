import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClinicEmergencyComponent } from './clinic-emergency.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { EmergencyService } from '../../../../../services/emergency.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('ClinicEmergencyComponent', () => {
  let component: ClinicEmergencyComponent;
  let fixture: ComponentFixture<ClinicEmergencyComponent>;
  let emergencyServiceMock: any;

  beforeEach(async () => {
    emergencyServiceMock = {
      getAllAlerts: jasmine.createSpy('getAllAlerts').and.returnValue(of([])),
      updateAlertStatus: jasmine.createSpy('updateAlertStatus').and.returnValue(of({ id: 1, status: 'ACKNOWLEDGED' }))
    };

    await TestBed.configureTestingModule({
      declarations: [ClinicEmergencyComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [
        { provide: EmergencyService, useValue: emergencyServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClinicEmergencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load alerts on init', () => {
    expect(emergencyServiceMock.getAllAlerts).toHaveBeenCalled();
  });

  it('should filter alerts by status', () => {
    component.alerts = [
      { id: 1, status: 'PENDING' } as any,
      { id: 2, status: 'RESOLVED' } as any
    ];

    component.onFilterChange('PENDING');
    expect(component.filteredAlerts.length).toBe(1);
    expect(component.filteredAlerts[0].id).toBe(1);

    component.onFilterChange('ALL');
    expect(component.filteredAlerts.length).toBe(2);
  });

  it('should call acknowledge and update alert list', () => {
    component.alerts = [{ id: 1, status: 'PENDING' } as any];
    component.acknowledge(component.alerts[0]);
    expect(emergencyServiceMock.updateAlertStatus).toHaveBeenCalledWith(1, 'ACKNOWLEDGED');
  });

  it('should call resolve and update alert list', () => {
     emergencyServiceMock.updateAlertStatus.and.returnValue(of({ id: 2, status: 'RESOLVED' }));
     component.alerts = [{ id: 2, status: 'PENDING' } as any];
     component.resolve(component.alerts[0]);
     expect(emergencyServiceMock.updateAlertStatus).toHaveBeenCalledWith(2, 'RESOLVED');
  });

  it('should calculate pending and critical count', () => {
    component.alerts = [
      { id: 1, status: 'PENDING', severity: 'CRITICAL' } as any,
      { id: 2, status: 'PENDING', severity: 'HIGH' } as any,
      { id: 3, status: 'RESOLVED', severity: 'CRITICAL' } as any
    ];

    expect(component.pendingCount).toBe(2);
    expect(component.criticalCount).toBe(2);
  });
});
