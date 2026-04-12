import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PharmacyOrderService } from './pharmacy-order.service';
import { 
  PharmacyOrderRequestDTO, 
  PharmacyOrderResponseDTO,
  UpdateOrderStatusDTO,
  RejectOrderDTO
} from '../models/pharmacy-order.model';

describe('PharmacyOrderService', () => {
  let service: PharmacyOrderService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8081/springsecurity/api/pharmacy/orders';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PharmacyOrderService]
    });
    service = TestBed.inject(PharmacyOrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create an order', () => {
    const mockRequest: PharmacyOrderRequestDTO = { pharmacyId: 1, items: [] } as any;
    const mockResponse: PharmacyOrderResponseDTO = { id: 1, status: 'PENDING' } as any;

    service.createOrder(mockRequest).subscribe(res => {
      expect(res.id).toBe(1);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should get order by id', () => {
    const mockResponse: PharmacyOrderResponseDTO = { id: 1, pharmacyId: 1 } as any;

    service.getOrderById(1).subscribe(res => {
      expect(res.id).toBe(1);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should update order status', () => {
    const mockDto: UpdateOrderStatusDTO = { status: 'CONFIRMED' } as any;
    const mockResponse: PharmacyOrderResponseDTO = { id: 1, status: 'CONFIRMED' } as any;

    service.updateOrderStatus(1, mockDto).subscribe(res => {
      expect(res.status).toBe('CONFIRMED');
    });

    const req = httpMock.expectOne(`${apiUrl}/1/status`);
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse);
  });

  it('should cancel an order', () => {
    const mockResponse: PharmacyOrderResponseDTO = { id: 1, status: 'CANCELLED' } as any;

    service.cancelOrder(1, 'User requested').subscribe(res => {
      expect(res.status).toBe('CANCELLED');
    });

    const req = httpMock.expectOne(`${apiUrl}/1/cancel`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ reason: 'User requested' });
    req.flush(mockResponse);
  });

  it('should reject an order', () => {
    const mockDto: RejectOrderDTO = { reason: 'Out of stock' } as any;
    const mockResponse: PharmacyOrderResponseDTO = { id: 1, status: 'REJECTED' } as any;

    service.rejectOrder(1, mockDto).subscribe(res => {
      expect(res.status).toBe('REJECTED');
    });

    const req = httpMock.expectOne(`${apiUrl}/1/reject`);
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse);
  });

  it('should download invoice as blob', () => {
    const mockBlob = new Blob(['invoice content'], { type: 'application/pdf' });

    service.downloadInvoice(1).subscribe(res => {
      expect(res instanceof Blob).toBeTrue();
      expect(res.size).toBeGreaterThan(0);
    });

    const req = httpMock.expectOne(`${apiUrl}/1/invoice`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });
});
