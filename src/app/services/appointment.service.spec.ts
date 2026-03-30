import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppointmentService } from './appointment.service';
import { AppointmentDTO } from '../models/appointment.model';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:8081/springsecurity/api/v1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AppointmentService]
    });
    service = TestBed.inject(AppointmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all appointments', () => {
    const mockAppts: AppointmentDTO[] = [{ id: 1 } as any];
    service.getAllAppointments().subscribe(appts => {
      expect(appts.length).toBe(1);
      expect(appts).toEqual(mockAppts);
    });

    const req = httpMock.expectOne(`${baseUrl}/appointments`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAppts);
  });

  it('should get patient appointments', () => {
    const patientId = 123;
    service.getPatientAppointments(patientId).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/appointments/patients/${patientId}/appointments`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get doctor appointments', () => {
    const doctorId = 456;
    service.getDoctorAppointments(doctorId).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/appointments/doctors/${doctorId}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get doctor appointments with date param', () => {
    const doctorId = 456;
    const date = '2026-03-30';
    service.getDoctorAppointments(doctorId, date).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/appointments/doctors/${doctorId}?date=${date}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should confirm appointment', () => {
    const id = 1;
    service.confirmAppointment(id).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/appointments/${id}/confirm`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should cancel appointment', () => {
    const id = 1;
    service.cancelAppointment(id).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/appointments/${id}/cancel`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should delete appointment', () => {
    const id = 1;
    service.deleteAppointment(id).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/appointments/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should start teleconsultation', () => {
    const id = 1;
    service.startTeleconsultation(id).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/appointments/${id}/start-live`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
