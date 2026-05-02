import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PaymentService } from './payment.service';
import { PaymentRequestDTO, PaymentResponseDTO } from '../models/payment.model';

describe('PaymentService', () => {
  let service: PaymentService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8081/springsecurity/api/pharmacy/payments';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymentService]
    });
    service = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initiate payment', () => {
    const mockRequest: PaymentRequestDTO = { orderId: 10, amount: 100, method: 'CARD' } as any;
    const mockResponse: PaymentResponseDTO = { id: 1, status: 'PENDING' } as any;

    service.initiatePayment(mockRequest).subscribe(res => {
      expect(res.id).toBe(1);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockResponse);
  });

  it('should get payment by order id', () => {
    const mockResponse: PaymentResponseDTO = { id: 1, orderId: 10 } as any;

    service.getPaymentByOrderId(10).subscribe(res => {
      expect(res.orderId).toBe(10);
    });

    const req = httpMock.expectOne(`${apiUrl}/order/10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create payment intent', () => {
    const mockResponse: PaymentResponseDTO = { clientSecret: 'secret_123' } as any;

    service.createPaymentIntent(10).subscribe(res => {
      expect(res.clientSecret).toBe('secret_123');
    });

    const req = httpMock.expectOne(`${apiUrl}/create-payment-intent/10`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should verify payment', () => {
    const mockResponse: PaymentResponseDTO = { id: 1, status: 'COMPLETED' } as any;

    service.verifyPayment(1).subscribe(res => {
      expect(res.status).toBe('COMPLETED');
    });

    const req = httpMock.expectOne(`${apiUrl}/verify/1`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
