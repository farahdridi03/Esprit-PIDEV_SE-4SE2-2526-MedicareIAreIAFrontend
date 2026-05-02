import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:8081/springsecurity/api/admin';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService]
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get pending pharmacists', () => {
    const mockPharmacists = [{ id: 1, fullName: 'Pharma 1' }];
    service.getPendingPharmacists().subscribe(data => {
      expect(data.length).toBe(1);
      expect(data[0].id).toBe(1);
    });

    const req = httpMock.expectOne(`${baseUrl}/pending-pharmacists`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPharmacists);
  });

  it('should approve a pharmacist', () => {
    service.approvePharmacist(1).subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`${baseUrl}/approve-pharmacist/1`);
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
  });

  it('should reject a pharmacist', () => {
    service.rejectPharmacist(1).subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`${baseUrl}/reject-pharmacist/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should get pending homecare providers', () => {
    const mockProviders = [{ id: 1, name: 'Provider 1' }];
    service.getPendingProviders().subscribe(data => {
      expect(data.length).toBe(1);
    });

    const req = httpMock.expectOne(`${baseUrl}/homecare/pending`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProviders);
  });

  it('should approve a homecare provider', () => {
    service.approveProvider(1).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/homecare/approve/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ status: 'approved' });
  });

  it('should reject a homecare provider', () => {
    service.rejectProvider(1).subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`${baseUrl}/homecare/reject/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
