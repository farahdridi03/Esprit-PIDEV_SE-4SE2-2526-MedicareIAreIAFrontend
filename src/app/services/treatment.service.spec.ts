import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TreatmentService } from './treatment.service';
import { MOCK_PATIENT_ME } from '../testing/mocks/medical-record.mock';

describe('TreatmentService', () => {
    let service: TreatmentService;
    let httpMock: HttpTestingController;
    const apiUrl = 'http://localhost:8081/springsecurity/treatment';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [TreatmentService]
        });
        service = TestBed.inject(TreatmentService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch all treatments', () => {
        const mockTreatments = MOCK_PATIENT_ME.treatments || [];
        service.getAll().subscribe(treatments => {
            expect(treatments).toEqual(mockTreatments as any);
        });

        const req = httpMock.expectOne(`${apiUrl}/all`);
        expect(req.request.method).toBe('GET');
        req.flush(mockTreatments);
    });

    it('should add a treatment', () => {
        const mockTreatment = MOCK_PATIENT_ME.treatments?.[0];
        service.add(mockTreatment as any).subscribe(treatment => {
            expect(treatment).toEqual(mockTreatment as any);
        });

        const req = httpMock.expectOne(`${apiUrl}/add`);
        expect(req.request.method).toBe('POST');
        req.flush(mockTreatment || null);
    });

    it('should update a treatment', () => {
        const id = 1;
        const mockTreatment = MOCK_PATIENT_ME.treatments?.[0];
        service.update(id, mockTreatment as any).subscribe(treatment => {
            expect(treatment).toEqual(mockTreatment as any);
        });

        const req = httpMock.expectOne(`${apiUrl}/update/${id}`);
        expect(req.request.method).toBe('PUT');
        req.flush(mockTreatment || null);
    });

    it('should delete a treatment', () => {
        const id = 1;
        service.delete(id).subscribe(response => {
            expect(response).toBeNull();
        });

        const req = httpMock.expectOne(`${apiUrl}/delete/${id}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });
});
