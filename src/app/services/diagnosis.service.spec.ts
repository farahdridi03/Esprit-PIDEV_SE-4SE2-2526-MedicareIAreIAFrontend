import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DiagnosisService } from './diagnosis.service';
import { MOCK_PATIENT_ME } from '../testing/mocks/medical-record.mock';

describe('DiagnosisService', () => {
    let service: DiagnosisService;
    let httpMock: HttpTestingController;
    const apiUrl = 'http://localhost:8081/springsecurity/diagnosis';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DiagnosisService]
        });
        service = TestBed.inject(DiagnosisService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch all diagnoses', () => {
        const mockDiagnoses = MOCK_PATIENT_ME.diagnoses || [];
        service.getAll().subscribe(diagnoses => {
            expect(diagnoses).toEqual(mockDiagnoses as any);
        });

        const req = httpMock.expectOne(`${apiUrl}/all`);
        expect(req.request.method).toBe('GET');
        req.flush(mockDiagnoses);
    });

    it('should add a diagnosis', () => {
        const mockDiagnosis = MOCK_PATIENT_ME.diagnoses?.[0];
        service.add(mockDiagnosis as any).subscribe(diagnosis => {
            expect(diagnosis).toEqual(mockDiagnosis as any);
        });

        const req = httpMock.expectOne(`${apiUrl}/add`);
        expect(req.request.method).toBe('POST');
        req.flush(mockDiagnosis || null);
    });

    it('should update a diagnosis', () => {
        const id = 1;
        const mockDiagnosis = MOCK_PATIENT_ME.diagnoses?.[0];
        service.update(id, mockDiagnosis as any).subscribe(diagnosis => {
            expect(diagnosis).toEqual(mockDiagnosis as any);
        });

        const req = httpMock.expectOne(`${apiUrl}/update/${id}`);
        expect(req.request.method).toBe('PUT');
        req.flush(mockDiagnosis || null);
    });

    it('should delete a diagnosis', () => {
        const id = 1;
        service.delete(id).subscribe(response => {
            expect(response).toBeNull();
        });

        const req = httpMock.expectOne(`${apiUrl}/delete/${id}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });
});
