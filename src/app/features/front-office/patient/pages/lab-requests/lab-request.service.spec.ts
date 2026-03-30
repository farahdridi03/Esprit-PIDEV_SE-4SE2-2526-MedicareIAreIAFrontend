import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LabRequestService, LabRequestPayload, LabRequestResponse } from './lab-request.service';

describe('LabRequestService', () => {
  let service: LabRequestService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LabRequestService]
    });
    service = TestBed.inject(LabRequestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch laboratories', () => {
    const mockLabs = [{ id: 1, name: 'Lab A' }];
    service.getLaboratories().subscribe(labs => {
      expect(labs.length).toBe(1);
      expect(labs[0].name).toBe('Lab A');
    });

    const req = httpMock.expectOne('/springsecurity/api/laboratories');
    expect(req.request.method).toBe('GET');
    req.flush(mockLabs);
  });

  it('should create lab request', () => {
    const payload: LabRequestPayload = {
      patientId: 1, laboratoryId: 2, testType: 'Blood',
      scheduledAt: '2024-03-29', clinicalNotes: 'Notes',
      requestedBy: 'Patient', doctorId: null
    };
    const mockResponse: LabRequestResponse = { id: 10, ...payload, patientName: 'John', laboratoryName: 'Lab B', status: 'PENDING' };

    service.create(payload).subscribe(resp => {
      expect(resp.id).toBe(10);
      expect(resp.status).toBe('PENDING');
    });

    const req = httpMock.expectOne('/springsecurity/api/lab-requests');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should get requests by patient ID', () => {
    const patientId = 5;
    service.getByPatient(patientId).subscribe(data => {
      expect(data.length).toBe(0);
    });

    const req = httpMock.expectOne(`/springsecurity/api/lab-requests/patient/${patientId}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should cancel request', () => {
    service.cancel(123).subscribe();
    const req = httpMock.expectOne('/springsecurity/api/lab-requests/123/cancel');
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });
});
