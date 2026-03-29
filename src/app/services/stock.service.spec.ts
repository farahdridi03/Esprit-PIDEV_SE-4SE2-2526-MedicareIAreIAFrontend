import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StockService } from './stock.service';
import { PharmacyStock, ReceiveBatchRequest, StockMovementRequest, StockMovement } from '../models/stock.model';

describe('StockService', () => {
  let service: StockService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8081/springsecurity/api/stocks';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StockService]
    });
    service = TestBed.inject(StockService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get stock by pharmacy id', () => {
    const mockStock: PharmacyStock[] = [
      { id: 1, totalQuantity: 100, minQuantityThreshold: 10, product: { name: 'Aspirin' } as any, pharmacy: { name: 'Central' } as any }
    ];

    service.getStockByPharmacyId(1).subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0].product.name).toBe('Aspirin');
    });

    const req = httpMock.expectOne(`${apiUrl}/pharmacy/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStock);
  });

  it('should receive a batch', () => {
    const request: ReceiveBatchRequest = {
      pharmacyId: 1,
      productId: 1,
      batchNumber: 'B123',
      quantity: 50,
      expirationDate: '2027-01-01',
      purchasePrice: 5.0,
      sellingPrice: 10.0,
      minQuantityThreshold: 5
    };

    service.receiveBatch(request).subscribe(res => {
      expect(res.batchNumber).toBe('B123');
    });

    const req = httpMock.expectOne(`${apiUrl}/batches/receive`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ ...request, id: 1, receivedAt: '2026-03-29' } as any);
  });

  it('should add a movement (e.g., dispense)', () => {
    const request: StockMovementRequest = {
      pharmacyStockId: 1,
      movementType: 'OUT',
      quantity: 2,
      reference: 'PRESCRIPTION-123'
    };

    service.addMovement(request).subscribe((res: StockMovement) => {
      expect(res.movementType).toBe('OUT');
      expect(res.quantity).toBe(2);
    });

    const req = httpMock.expectOne(`${apiUrl}/movements`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ ...request, id: 1, createdAt: '2026-03-29' });
  });

  it('should handle insufficient stock error (business requirement)', () => {
    const request: StockMovementRequest = {
       pharmacyStockId: 1,
       movementType: 'OUT',
       quantity: 1000, // Excessive amount
       reference: 'FAIL-123'
    };
    
    const errorResponse = { message: 'Insufficient stock available' };
    
    service.addMovement(request).subscribe({
      next: () => fail('should have failed with 400 error'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.error.message).toBe('Insufficient stock available');
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/movements`);
    req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
  });

  it('should get all open alerts', () => {
    const mockAlerts = [{ id: 1, message: 'Stock low', alertType: 'LOW_STOCK', resolved: false }];
    service.getAllOpenAlerts().subscribe(res => {
        expect(res.length).toBe(1);
    });
    const req = httpMock.expectOne(`${apiUrl}/alerts/open`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAlerts);
  });

  it('should resolve an alert', () => {
    service.resolveAlert(1).subscribe(() => {});
    const req = httpMock.expectOne(`${apiUrl}/alerts/1/resolve`);
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
  });
});
