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
      startTeleconsultation: jasmine.createSpy('startTeleconsultation').and.returnValue(of({ meetingLink: 'http://test.com' })),
      completeAppointment: jasmine.createSpy('completeAppointment').and.returnValue(of({ status: 'COMPLETED' }))
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
      { id: 1, date: todayStr, patientId: 101, patientName: 'Patient 1', status: 'BOOKED', startTime: '10:00', endTime: '11:00', mode: 'OFFICE', doctorId: 1 },
      { id: 2, date: '2026-01-01', patientId: 102, patientName: 'Patient 2', status: 'COMPLETED', startTime: '09:00', endTime: '10:00', mode: 'ONLINE', doctorId: 1 }
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
      { id: 1, date: '2026-03-01', patientId: 101, patientName: 'Patient 1', status: 'COMPLETED', startTime: '10:00', endTime: '11:00', mode: 'OFFICE', doctorId: 1 },
      { id: 2, date: '2026-03-15', patientId: 101, patientName: 'Patient 1', status: 'BOOKED', startTime: '10:00', endTime: '11:00', mode: 'OFFICE', doctorId: 1 }, // Newer appointment for same patient
      { id: 3, date: '2026-03-10', patientId: 103, patientName: 'Patient 3', status: 'COMPLETED', startTime: '10:00', endTime: '11:00', mode: 'OFFICE', doctorId: 1 }
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

  it('should start teleconsultation and open link with prejoin disabled', () => {
    spyOn(window, 'open');
    const mockAppt = { id: 789, status: 'CONFIRMED', patientId: 1, date: '', startTime: '10:00', endTime: '11:00', mode: 'ONLINE', doctorId: 1 };
    
    component.startConsultation(mockAppt as any);
    
    expect(mockAppointmentService.startTeleconsultation).toHaveBeenCalledWith(789);
    // Should open link with prejoin disabled and displayName injected
    const openCall = (window.open as jasmine.Spy).calls.mostRecent().args[0] as string;
    expect(openCall).toContain('http://test.com');
    expect(openCall).toContain('config.prejoinPageEnabled=false');
    expect(openCall).toContain('userInfo.displayName');
    expect(window.open).toHaveBeenCalledWith(openCall, '_blank');
  });

  it('should open meeting link with prejoin disabled', () => {
    spyOn(window, 'open');
    component.openMeeting('https://8x8.vc/test-room');
    const openCall = (window.open as jasmine.Spy).calls.mostRecent().args[0] as string;
    expect(openCall).toContain('config.prejoinPageEnabled=false');
    expect(openCall).toContain('Dr.');
  });

  it('should not open meeting if link is undefined', () => {
    spyOn(window, 'open');
    component.openMeeting(undefined);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('should complete consultation and reload data', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const mockAppt = { id: 42, status: 'LIVE', mode: 'ONLINE', patientId: 1, date: '', startTime: '', endTime: '', doctorId: 1 };
    
    component.completeConsultation(mockAppt as any);
    
    expect(mockAppointmentService.completeAppointment).toHaveBeenCalledWith(42);
    // Reloads: 1 ngOnInit + 1 complete
    expect(mockAppointmentService.getDoctorAppointments).toHaveBeenCalledTimes(2);
  });

  it('should NOT complete consultation if doctor cancels confirm dialog', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const mockAppt = { id: 42, status: 'LIVE', mode: 'ONLINE', patientId: 1, date: '', startTime: '', endTime: '', doctorId: 1 };
    
    component.completeConsultation(mockAppt as any);
    
    expect(mockAppointmentService.completeAppointment).not.toHaveBeenCalled();
  });

  it('should handle display mode status labels correctly', () => {
    expect(component.displayMode).toBe('today');
    component.setMode('all');
    expect(component.displayMode).toBe('all');
  });
});
