import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConsultationService } from './consultation.service';
import { MOCK_PATIENT_ME } from '../testing/mocks/medical-record.mock';

describe('ConsultationService', () => {
    let service: ConsultationService;
    let httpMock: HttpTestingController;
    const apiUrl = 'http://localhost:8081/springsecurity/consultation';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ConsultationService]
        });
        service = TestBed.inject(ConsultationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch all consultations', () => {
        const mockConsultations = MOCK_PATIENT_ME.consultations || [];
        service.getAll().subscribe(consultations => {
            expect(consultations).toEqual(mockConsultations as any);
        });

        const req = httpMock.expectOne(`${apiUrl}/all`);
        expect(req.request.method).toBe('GET');
        req.flush(mockConsultations);
    });

    it('should add a consultation', () => {
        const mockConsultation = MOCK_PATIENT_ME.consultations?.[0];
        service.add(mockConsultation as any).subscribe(consultation => {
            expect(consultation).toEqual(mockConsultation as any);
        });

        const req = httpMock.expectOne(`${apiUrl}/add`);
        expect(req.request.method).toBe('POST');
        req.flush(mockConsultation || null);
    });

    it('should update a consultation', () => {
        const id = 1;
        const mockConsultation = MOCK_PATIENT_ME.consultations?.[0];
        service.update(id, mockConsultation as any).subscribe(consultation => {
            expect(consultation).toEqual(mockConsultation as any);
        });

        const req = httpMock.expectOne(`${apiUrl}/update/${id}`);
        expect(req.request.method).toBe('PUT');
        req.flush(mockConsultation || null);
    });

    it('should delete a consultation', () => {
        const id = 1;
        service.delete(id).subscribe(response => {
            expect(response).toBeNull();
        });

        const req = httpMock.expectOne(`${apiUrl}/delete/${id}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });
});
