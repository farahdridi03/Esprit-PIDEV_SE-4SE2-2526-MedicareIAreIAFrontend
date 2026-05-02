import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientService } from './patient.service';
import { PatientRequestDTO, PatientResponseDTO } from '../models/patient.model';

describe('PatientService', () => {
    let service: PatientService;
    let httpMock: HttpTestingController;
    const apiUrl = 'http://localhost:8081/springsecurity/api/patients';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [PatientService]
        });
        service = TestBed.inject(PatientService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create a patient', () => {
        const mockDto: PatientRequestDTO = { fullName: 'John Doe', email: 'john@test.com' } as any;
        const mockResponse: PatientResponseDTO = { id: 1, ...mockDto } as any;

        service.create(mockDto).subscribe(res => {
            expect(res.id).toBe(1);
        });

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
    });

    it('should get patient by id', () => {
        const mockResponse: PatientResponseDTO = { id: 1, fullName: 'John Doe' } as any;

        service.getById(1).subscribe(res => {
            expect(res.id).toBe(1);
        });

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should get all patients', () => {
        const mockResponse: PatientResponseDTO[] = [{ id: 1, fullName: 'John Doe' }] as any;

        service.getAll().subscribe(res => {
            expect(res.length).toBe(1);
        });

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should update patient', () => {
        const mockDto: PatientRequestDTO = { fullName: 'Updated' } as any;
        const mockResponse: PatientResponseDTO = { id: 1, fullName: 'Updated' } as any;

        service.update(1, mockDto).subscribe(res => {
            expect(res.fullName).toBe('Updated');
        });

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('PUT');
        req.flush(mockResponse);
    });

    it('should delete patient', () => {
        service.delete(1).subscribe(res => {
            expect(res).toBeNull();
        });

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });

    it('should toggle patient status', () => {
        service.toggleEnabled(1).subscribe(res => {
            expect(res).toBeNull();
        });

        const req = httpMock.expectOne(`${apiUrl}/1/toggle`);
        expect(req.request.method).toBe('PATCH');
        req.flush(null);
    });
});
