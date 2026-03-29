import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DoctorPatientsComponent } from './doctor-patients.component';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';
import { AppointmentService } from '../../../../../services/appointment.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DoctorPatientsComponent', () => {
  let component: DoctorPatientsComponent;
  let fixture: ComponentFixture<DoctorPatientsComponent>;
  
  // Mocks
  let mockAuthService: any;
  let mockAppointmentService: any;

  beforeEach(async () => {
    mockAuthService = {
      getUserFullName: jasmine.createSpy('getUserFullName').and.returnValue('Dr. House'),
      getUserId: jasmine.createSpy('getUserId').and.returnValue(1)
    };

    mockAppointmentService = {
      getDoctorAppointments: jasmine.createSpy('getDoctorAppointments').and.returnValue(of([])),
      confirmAppointment: jasmine.createSpy('confirmAppointment').and.returnValue(of({ success: true })),
      startTeleconsultation: jasmine.createSpy('startTeleconsultation').and.returnValue(of({ meetingLink: 'http://test.com' }))
    };

    await TestBed.configureTestingModule({
      declarations: [ DoctorPatientsComponent ],
      providers: [
        { provide: ChangeDetectorRef, useValue: { detectChanges: () => {} } },
        { provide: AuthService, useValue: mockAuthService },
        { provide: AppointmentService, useValue: mockAppointmentService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorPatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load appointments on init', () => {
    expect(mockAuthService.getUserId).toHaveBeenCalled();
    expect(mockAppointmentService.getDoctorAppointments).toHaveBeenCalled();
  });

  it('should filter today appointments correctly', () => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    const mockAppts = [
      { id: 1, date: todayStr, patientId: 101, patientName: 'Patient 1', status: 'BOOKED', startTime: '10:00' },
      { id: 2, date: '2026-01-01', patientId: 102, patientName: 'Patient 2', status: 'COMPLETED', startTime: '09:00' }
    ];
    
    // Simulate loading data
    mockAppointmentService.getDoctorAppointments.and.returnValue(of(mockAppts));
    component.loadTodayAppointments(1);
    
    expect(component.todayAppointments.length).toBe(1);
    expect(component.todayAppointments[0].id).toBe(1);
    expect(component.allPatients.length).toBe(2);
  });

  it('should generate a unique patient list from appointments', () => {
    const mockAppts = [
      { id: 1, date: '2026-03-01', patientId: 101, patientName: 'Patient 1', status: 'COMPLETED' },
      { id: 2, date: '2026-03-15', patientId: 101, patientName: 'Patient 1', status: 'BOOKED' }, // Newer appointment for same patient
      { id: 3, date: '2026-03-10', patientId: 103, patientName: 'Patient 3', status: 'COMPLETED' }
    ];
    
    mockAppointmentService.getDoctorAppointments.and.returnValue(of(mockAppts));
    component.loadTodayAppointments(1);
    
    expect(component.allPatients.length).toBe(2); // Two unique patients
    const patient101 = component.allPatients.find(p => p.id === 101);
    expect(patient101.totalAppointments).toBe(2);
    expect(patient101.lastAppointmentDate).toBe('2026-03-15'); // Picks the latest
  });

  it('should switch display modes', () => {
    component.setMode('all');
    expect(component.displayMode).toBe('all');
    
    component.setMode('today');
    expect(component.displayMode).toBe('today');
  });

  it('should confirm appointment and reload data', () => {
    component.confirmAppointment(123);
    expect(mockAppointmentService.confirmAppointment).toHaveBeenCalledWith(123);
    // Reloads (1 init + 1 confirm)
    expect(mockAppointmentService.getDoctorAppointments).toHaveBeenCalledTimes(2);
  });

  it('should start teleconsultation and open link', () => {
    spyOn(window, 'open');
    const mockAppt = { id: 789, status: 'BOOKED', patientId: 1, date: '', startTime: '10:00', endTime: '11:00', mode: 'ONLINE', doctorId: 1 };
    
    component.startConsultation(mockAppt as any);
    
    expect(mockAppointmentService.startTeleconsultation).toHaveBeenCalledWith(789);
    expect(window.open).toHaveBeenCalledWith('http://test.com', '_blank');
  });

  it('should handle display mode status labels correctly', () => {
    // Mode indicator tests are in HTML, but logic ensures state
    expect(component.displayMode).toBe('today');
    component.setMode('all');
    expect(component.displayMode).toBe('all');
  });
});
