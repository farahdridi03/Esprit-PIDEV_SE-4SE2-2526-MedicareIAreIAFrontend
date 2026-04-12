import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DeliveryService } from './delivery.service';
import { DeliveryStatus } from '../models/delivery.model';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:8081/springsecurity/api/pharmacy/deliveries';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DeliveryService]
    });
    service = TestBed.inject(DeliveryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should dispatch an order', () => {
    const mockDelivery: any = { id: 1, orderId: 10, agentId: 5 };
    service.dispatchOrder(10, 5).subscribe(delivery => {
      expect(delivery.id).toBe(1);
    });

    const req = httpMock.expectOne(`${baseUrl}/dispatch`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ orderId: 10, agentId: 5 });
    req.flush(mockDelivery);
  });

  it('should update delivery status', () => {
    const mockDelivery: any = { id: 1, status: 'SHIPPED' };
    service.updateStatus(1, 'SHIPPED' as DeliveryStatus).subscribe(delivery => {
      expect(delivery.status).toBe('SHIPPED');
    });

    const req = httpMock.expectOne(`${baseUrl}/1/status?status=SHIPPED`);
    expect(req.request.method).toBe('PATCH');
    req.flush(mockDelivery);
  });

  it('should get delivery by order id', () => {
    const mockDelivery: any = { id: 1, orderId: 10 };
    service.getDeliveryByOrderId(10).subscribe(delivery => {
      expect(delivery.orderId).toBe(10);
    });

    const req = httpMock.expectOne(`${baseUrl}/order/10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDelivery);
  });

  it('should get agencies', () => {
    const mockAgencies = [{ id: 1, name: 'Agency 1' }];
    service.getAgencies().subscribe(data => {
      expect(data.length).toBe(1);
    });

    const req = httpMock.expectOne(`${baseUrl}/agencies`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAgencies);
  });

  it('should get agents by agency', () => {
    const mockAgents = [{ id: 5, fullName: 'Agent 5' }];
    service.getAgentsByAgency(1).subscribe(data => {
      expect(data.length).toBe(1);
    });

    const req = httpMock.expectOne(`${baseUrl}/agencies/1/agents`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAgents);
  });

  it('should assign an agent', () => {
    const mockDelivery: any = { id: 1, agentId: 5 };
    service.assignAgent(1, 5).subscribe(delivery => {
      expect((delivery as any).agentId).toBe(5);
    });

    const req = httpMock.expectOne(`${baseUrl}/1/assign/5`);
    expect(req.request.method).toBe('POST');
    req.flush(mockDelivery);
  });
});
