import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PrescriptionService } from './prescription.service';
import { MOCK_PATIENT_ME } from '../testing/mocks/medical-record.mock';

describe('PrescriptionService', () => {
    let service: PrescriptionService;
    let httpMock: HttpTestingController;
    const apiUrl = 'http://localhost:8081/springsecurity/prescription';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [PrescriptionService]
        });
        service = TestBed.inject(PrescriptionService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch all prescriptions', () => {
        const mockPrescriptions = MOCK_PATIENT_ME.prescriptions || [];
        service.getAll().subscribe(prescriptions => {
            expect(prescriptions).toEqual(mockPrescriptions as any);
        });

        const req = httpMock.expectOne(`${apiUrl}/all`);
        expect(req.request.method).toBe('GET');
        req.flush(mockPrescriptions);
    });

    it('should add a prescription', () => {
        const mockPrescription = MOCK_PATIENT_ME.prescriptions?.[0];
        service.add(mockPrescription as any).subscribe(prescription => {
            expect(prescription).toEqual(mockPrescription as any);
        });

        const req = httpMock.expectOne(`${apiUrl}/add`);
        expect(req.request.method).toBe('POST');
        req.flush(mockPrescription || null);
    });

    it('should update a prescription', () => {
        const id = 1;
        const mockPrescription = MOCK_PATIENT_ME.prescriptions?.[0];
        service.update(id, mockPrescription as any).subscribe(prescription => {
            expect(prescription).toEqual(mockPrescription as any);
        });

        const req = httpMock.expectOne(`${apiUrl}/update/${id}`);
        expect(req.request.method).toBe('PUT');
        req.flush(mockPrescription || null);
    });

    it('should delete a prescription', () => {
        const id = 1;
        service.delete(id).subscribe(response => {
            expect(response).toBeNull();
        });

        const req = httpMock.expectOne(`${apiUrl}/delete/${id}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });
});
