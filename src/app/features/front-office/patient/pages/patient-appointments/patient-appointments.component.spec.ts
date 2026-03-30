import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { PatientAppointmentsComponent } from './patient-appointments.component';
import { AppointmentService } from '../../../../../services/appointment.service';
import { AuthService } from '../../../../../services/auth.service';
import { AppointmentDTO } from '../../../../../models/appointment.model';

describe('PatientAppointmentsComponent', () => {
  let component: PatientAppointmentsComponent;
  let fixture: ComponentFixture<PatientAppointmentsComponent>;
  let appointmentServiceSpy: jasmine.SpyObj<AppointmentService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockAppointments: any[] = [
    { id: 1, date: '2100-01-01', startTime: '10:00', status: 'CONFIRMED', mode: 'ONLINE', doctorName: 'Dr. House' },
    { id: 2, date: '2020-01-01', startTime: '09:00', status: 'COMPLETED', mode: 'OFFICE', doctorName: 'Dr. Grey' },
    { id: 3, date: '2100-02-01', startTime: '11:00', status: 'CANCELLED', mode: 'ONLINE', doctorName: 'Dr. House' }
  ];

  beforeEach(async () => {
    const apptSpy = jasmine.createSpyObj('AppointmentService', [
      'getPatientAppointments',
      'cancelAppointment',
      'deleteAppointment',
      'completeAppointment'
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', ['getUserId', 'getUserFullName']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [PatientAppointmentsComponent],
      providers: [
        { provide: AppointmentService, useValue: apptSpy },
        { provide: AuthService, useValue: authSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    appointmentServiceSpy = TestBed.inject(AppointmentService) as jasmine.SpyObj<AppointmentService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  beforeEach(() => {
    authServiceSpy.getUserId.and.returnValue(1);
    appointmentServiceSpy.getPatientAppointments.and.returnValue(of(mockAppointments as any[]));
    
    fixture = TestBed.createComponent(PatientAppointmentsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy(); // Clear interval
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load and filter appointments on init', () => {
    fixture.detectChanges();
    expect(appointmentServiceSpy.getPatientAppointments).toHaveBeenCalledWith(1);
    expect(component.appointments.length).toBe(3);
    expect(component.upcomingAppointments.length).toBe(1);
    expect(component.pastAppointments.length).toBe(1);
    expect(component.cancelledAppointments.length).toBe(1);
  });

  it('should handle error when loading appointments', () => {
    fixture.detectChanges();
    appointmentServiceSpy.getPatientAppointments.and.returnValue(throwError(() => new Error('Error')));
    component.loadAppointments();
    expect(component.error).toBe("Erreur lors du chargement des rendez-vous.");
    expect(component.isLoading).toBeFalse();
  });

  it('should toggle detail modal', () => {
    fixture.detectChanges();
    const appt = mockAppointments[0];
    component.viewDetails(appt as any);
    expect(component.selectedAppointment).toEqual(appt as any);
    
    component.closeDetails();
    expect(component.selectedAppointment).toBeNull();
  });

  it('should handle appointment cancellation workflow', () => {
    fixture.detectChanges();
    appointmentServiceSpy.cancelAppointment.and.returnValue(of(void 0));
    
    component.cancelAppointment(1);
    expect(component.showCancelModal).toBeTrue();
    expect(component.appointmentToCancelId).toBe(1);
    
    component.confirmCancelAppointment();
    expect(appointmentServiceSpy.cancelAppointment).toHaveBeenCalledWith(1);
    expect(component.showCancelModal).toBeFalse();
  });

  it('should handle appointment deletion workflow', () => {
    fixture.detectChanges();
    appointmentServiceSpy.deleteAppointment.and.returnValue(of(void 0));
    
    component.openDeleteModal(2);
    expect(component.showDeleteModal).toBeTrue();
    expect(component.appointmentToDeleteId).toBe(2);
    
    component.confirmDeleteAppointment();
    expect(appointmentServiceSpy.deleteAppointment).toHaveBeenCalledWith(2);
    expect(component.showDeleteModal).toBeFalse();
  });

  it('should correctly compute teleconsultation state - WAITING_TIME', () => {
    fixture.detectChanges();
    const futureAppt: any = { 
        id: 4, 
        date: '2100-01-01', 
        startTime: '10:00', 
        status: 'CONFIRMED', 
        mode: 'ONLINE' 
    };
    expect(component.getTeleconsultationState(futureAppt)).toBe('WAITING_TIME');
  });

  it('should correctly compute teleconsultation state - LIVE', () => {
    fixture.detectChanges();
    const liveAppt: any = { 
        id: 5, 
        date: '2026-03-30', 
        startTime: '10:00', 
        status: 'LIVE', 
        mode: 'ONLINE' 
    };
    expect(component.getTeleconsultationState(liveAppt)).toBe('LIVE');
  });

  it('should correctly compute teleconsultation state - WAITING_CONFIRMATION', () => {
    fixture.detectChanges();
    const appt: any = { id: 6, date: '2100-01-01', startTime: '10:00', status: 'BOOKED', mode: 'ONLINE' };
    expect(component.getTeleconsultationState(appt)).toBe('WAITING_CONFIRMATION');
  });

  it('should return OTHER for non-ONLINE mode', () => {
    fixture.detectChanges();
    const appt: any = { id: 7, date: '2100-01-01', startTime: '10:00', status: 'CONFIRMED', mode: 'IN_PERSON' };
    expect(component.getTeleconsultationState(appt)).toBe('OTHER');
  });

  it('isTeleconsultationActive should be true only when LIVE + ONLINE', () => {
    fixture.detectChanges();
    const liveAppt: any = { status: 'LIVE', mode: 'ONLINE' };
    const confirmedAppt: any = { status: 'CONFIRMED', mode: 'ONLINE' };
    const completedAppt: any = { status: 'COMPLETED', mode: 'ONLINE' };
    expect(component.isTeleconsultationActive(liveAppt)).toBeTrue();
    expect(component.isTeleconsultationActive(confirmedAppt)).toBeFalse();
    expect(component.isTeleconsultationActive(completedAppt)).toBeFalse();
  });

  it('should open meeting link with prejoin disabled and patient name injected', () => {
    fixture.detectChanges();
    authServiceSpy.getUserFullName.and.returnValue('Jean Dupont');
    spyOn(window, 'open');
    component.openMeeting('https://8x8.vc/test-room');
    const openCall = (window.open as jasmine.Spy).calls.mostRecent().args[0] as string;
    expect(openCall).toContain('config.prejoinPageEnabled=false');
    expect(openCall).toContain('Jean');
  });

  it('should not open meeting if link is undefined', () => {
    fixture.detectChanges();
    spyOn(window, 'open');
    component.openMeeting(undefined);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('should polling updates', fakeAsync(() => {
    const loadSpy = spyOn(component, 'loadAppointments').and.callThrough();
    fixture.detectChanges(); // ngOnInit starts polling with the spy
    
    // Advance 10 seconds
    tick(10001);
    expect(loadSpy).toHaveBeenCalledWith(false);
    discardPeriodicTasks();
  }));
});
