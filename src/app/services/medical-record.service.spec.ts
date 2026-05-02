import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MedicalRecordService } from './medical-record.service';
import { MOCK_MEDICAL_RECORDS } from '../testing/mocks/medical-record.mock';

describe('MedicalRecordService', () => {
  let service: MedicalRecordService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8081/springsecurity/medical-record';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MedicalRecordService]
    });
    service = TestBed.inject(MedicalRecordService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all medical records', () => {
    service.getAll().subscribe(records => {
      expect(records).toEqual(MOCK_MEDICAL_RECORDS);
    });

    const req = httpMock.expectOne(`${apiUrl}/all`);
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_MEDICAL_RECORDS);
  });

  it('should fetch medical record by patient id', () => {
    const patientId = 101;
    const mockRecord = MOCK_MEDICAL_RECORDS[0];
    service.getByPatientId(patientId).subscribe(record => {
      expect(record).toEqual(mockRecord);
    });

    const req = httpMock.expectOne(`${apiUrl}/patient/${patientId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRecord);
  });

  it('should add a medical record', () => {
    const payload = { patientId: 101 };
    const mockResponse = { id: 1, ...payload };
    service.add(payload).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/add`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
