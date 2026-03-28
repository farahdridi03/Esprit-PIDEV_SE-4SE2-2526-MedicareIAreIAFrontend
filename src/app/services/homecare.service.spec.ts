import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HomecareService } from '../services/homecare.service';

describe('HomecareService', () => {
    let service: HomecareService;
    let httpMock: HttpTestingController;
    const apiUrl = 'http://localhost:8081/springsecurity/api/homecare';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HomecareService]
        });
        service = TestBed.inject(HomecareService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getAllServices', () => {
        it('should fetch available services', () => {
            const mockServices: any[] = [
                { id: 1, name: 'Nursing', price: 100 },
                { id: 2, name: 'Physiotherapy', price: 150 }
            ];

            service.getAllServices().subscribe((services: any) => {
                expect(services.length).toBe(2);
                expect(services[0].name).toBe('Nursing');
            });

            const req = httpMock.expectOne(`${apiUrl}/services`);
            expect(req.request.method).toBe('GET');
            req.flush(mockServices);
        });
    });

    describe('getAllProviders', () => {
        it('should fetch available providers', () => {
            const mockProviders: any[] = [
                { id: 1, fullName: 'John Doe', averageRating: 4.5 }
            ];

            service.getAllProviders().subscribe((providers: any) => {
                expect(providers.length).toBe(1);
                expect(providers[0].fullName).toBe('John Doe');
            });

            const req = httpMock.expectOne(`${apiUrl}/admin/providers`);
            expect(req.request.method).toBe('GET');
            req.flush(mockProviders);
        });
    });

    describe('getBlockedDates', () => {
        it('should fetch blocked dates for a provider', () => {
            const mockBlockedDates = ['2026-04-02', '2026-04-09'];

            service.getBlockedDates(6, '2026-03-28', '2026-06-26').subscribe(dates => {
                expect(dates.length).toBe(2);
                expect(dates).toContain('2026-04-02');
            });

            const req = httpMock.expectOne(
                `${apiUrl}/providers/6/blocked-dates?from=2026-03-28&to=2026-06-26`
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockBlockedDates);
        });
    });

    describe('createRequest', () => {
        it('should create a service request', () => {
            const mockRequest = {
                id: 1,
                service: { id: 1, name: 'Nursing' },
                status: 'PENDING'
            };

            const requestData = {
                serviceId: 1,
                requestedDateTime: '2026-04-05T10:00:00',
                address: '123 Main St',
                patientNotes: 'Please arrive on time'
            };

            service.createRequest(requestData as any).subscribe(request => {
                expect(request.id).toBe(1);
                expect(request.status).toBe('PENDING');
            });

            const req = httpMock.expectOne(`${apiUrl}/requests`);
            expect(req.request.method).toBe('POST');
            req.flush(mockRequest);
        });
    });

    describe('getProviderRequests', () => {
        it('should fetch requests for logged-in provider', () => {
            const mockRequests: any[] = [
                { id: 1, service: { name: 'Nursing' }, status: 'PENDING' }
            ];

            service.getProviderRequests().subscribe((requests: any) => {
                expect(requests.length).toBe(1);
                expect(requests[0].status).toBe('PENDING');
            });

            const req = httpMock.expectOne(`${apiUrl}/provider/requests`);
            expect(req.request.method).toBe('GET');
            req.flush(mockRequests);
        });
    });

    describe('acceptRequest', () => {
        it('should accept a request', () => {
            service.acceptRequest(1).subscribe(() => {
                expect(true).toBeTruthy();
            });

            const req = httpMock.expectOne(`${apiUrl}/provider/requests/1/accept`);
            expect(req.request.method).toBe('PUT');
            req.flush({ success: true });
        });
    });

    describe('declineRequest', () => {
        it('should decline a request', () => {
            service.declineRequest(1).subscribe(() => {
                expect(true).toBeTruthy();
            });

            const req = httpMock.expectOne(`${apiUrl}/provider/requests/1/decline`);
            expect(req.request.method).toBe('PUT');
            req.flush({ success: true });
        });
    });
});
