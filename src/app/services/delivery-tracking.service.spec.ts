import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DeliveryTrackingService } from './delivery-tracking.service';
import { NotificationService } from './notification.service';
import { Client } from '@stomp/stompjs';
import { take } from 'rxjs/operators';

// Mock pour StompJS Client
class MockStompClient {
  active = false;
  activate = jasmine.createSpy('activate');
  deactivate = jasmine.createSpy('deactivate');
  subscribe = jasmine.createSpy('subscribe');
  onConnect = (frame: any) => {};
  onStompError = (frame: any) => {};
  onWebSocketClose = () => {};
}

describe('DeliveryTrackingService', () => {
  let service: DeliveryTrackingService;
  let httpMock: HttpTestingController;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  const apiUrl = 'http://localhost:8081/springsecurity/api/pharmacy/deliveries';

  beforeEach(() => {
    const spy = jasmine.createSpyObj('NotificationService', ['addNotification']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DeliveryTrackingService,
        { provide: NotificationService, useValue: spy }
      ]
    });
    service = TestBed.inject(DeliveryTrackingService);
    httpMock = TestBed.inject(HttpTestingController);
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  afterEach(() => {
    httpMock.verify();
    service.disconnect();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get delivery details via HTTP', () => {
    const mockResponse: any = { id: 1, trackingUrl: 'TRK123' };
    service.getDeliveryDetails(10).subscribe(data => {
      expect(data.trackingUrl).toBe('TRK123');
    });

    const req = httpMock.expectOne(`${apiUrl}/order/10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should start with isConnected as false', (done) => {
    service.isConnected$.pipe(take(1)).subscribe(connected => {
      expect(connected).toBeFalse();
      done();
    });
  });

  // Note: Les tests WebSocket complets nécessitent normalement l'injection du Client
  // Ici nous vérifions principalement que le service gère son état interne.
  
  it('should update isConnected state on disconnect', (done) => {
    service.disconnect();
    service.isConnected$.pipe(take(1)).subscribe(connected => {
      expect(connected).toBeFalse();
      done();
    });
  });
});
