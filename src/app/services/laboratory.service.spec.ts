import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LaboratoryService } from './laboratory.service';
import { LaboratoryResponseDTO } from '../models/laboratory.model';

describe('LaboratoryService', () => {
    let service: LaboratoryService;
    let httpMock: HttpTestingController;
    const apiUrl = 'http://localhost:8081/springsecurity/api/laboratories/me';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [LaboratoryService]
        });
        service = TestBed.inject(LaboratoryService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch my laboratory info', () => {
        const mockLaboratory: LaboratoryResponseDTO = {
            id: 1,
            name: 'Central Lab',
            address: '123 Medical St',
            phone: '555-0123'
        };

        service.getMyLaboratory().subscribe(lab => {
            expect(lab).toEqual(mockLaboratory);
        });

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        req.flush(mockLaboratory);
    });

    it('should handle error when fetching laboratory info', () => {
        service.getMyLaboratory().subscribe({
            next: () => fail('should have failed with 404'),
            error: (error) => {
                expect(error.status).toBe(404);
            }
        });

        const req = httpMock.expectOne(apiUrl);
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
});
