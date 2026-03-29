import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EventService } from './event.service';
import { MedicalEvent, EventType } from '../models/event.model';

describe('EventService', () => {
  let service: EventService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:8081/springsecurity/api/events';

  const mockEvents: MedicalEvent[] = [
    { id: 1, title: 'Health Fair', description: 'Local health fair', date: '2026-05-01T10:00:00', eventType: 'PHYSICAL', venueName: 'City Hall' },
    { id: 2, title: 'Webinar', description: 'Webinar on nutrition', date: '2026-06-01T15:00:00', eventType: 'ONLINE', platformName: 'Zoom' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventService]
    });
    service = TestBed.inject(EventService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all events', () => {
    service.getAllEvents().subscribe(events => {
      expect(events.length).toBe(2);
      expect(events).toEqual(mockEvents);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvents);
  });

  it('should fetch event by id', () => {
    service.getEventById(1).subscribe(event => {
      expect(event.title).toBe('Health Fair');
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvents[0]);
  });

  it('should create an event', () => {
    const newEvent: MedicalEvent = { ...mockEvents[0], id: 0 };
    service.createEvent(newEvent).subscribe(event => {
      expect(event.id).toBe(1);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newEvent);
    req.flush({ ...newEvent, id: 1 });
  });

  it('should update an event', () => {
    const updateData: MedicalEvent = { ...mockEvents[0], title: 'Updated Fair' };
    service.updateEvent(1, updateData).subscribe(event => {
      expect(event.title).toBe('Updated Fair');
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(updateData);
  });

  it('should delete an event', () => {
    service.deleteEvent(1).subscribe(() => {});

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should fetch upcoming events', () => {
    service.getUpcomingEvents().subscribe(events => {
        expect(events.length).toBe(2);
    });
    const req = httpMock.expectOne(`${baseUrl}/upcoming`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvents);
  });

  it('should fetch events by type', () => {
    service.getEventsByType('ONLINE').subscribe(events => {
       expect(events.length).toBe(1);
    });
    const req = httpMock.expectOne(`${baseUrl}/type/ONLINE`);
    expect(req.request.method).toBe('GET');
    req.flush([mockEvents[1]]);
  });

  it('should handle API error gracefully', () => {
    const errorMsg = 'Event not found';
    service.getEventById(99).subscribe({
      next: () => fail('should have failed with 404 error'),
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.error).toBe(errorMsg);
      }
    });

    const req = httpMock.expectOne(`${baseUrl}/99`);
    req.flush(errorMsg, { status: 404, statusText: 'Not Found' });
  });
});
