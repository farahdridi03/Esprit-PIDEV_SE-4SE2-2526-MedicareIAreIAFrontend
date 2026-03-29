import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClinicService } from './clinic.service';
import { ClinicResponseDTO, ClinicUpdateRequestDTO } from '../models/clinic.model';

describe('ClinicService', () => {
    let service: ClinicService;
    let httpMock: HttpTestingController;
    const apiUrl = 'http://localhost:8081/springsecurity/api/clinics';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ClinicService]
        });
        service = TestBed.inject(ClinicService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch my clinic info', () => {
        const mockClinic: ClinicResponseDTO = {
            id: 1,
            fullName: 'Test Clinic',
            email: 'clinic@test.com',
            phone: '12345678',
            birthDate: '1990-01-01',
            photo: undefined,
            clinicName: 'Test Clinic Name',
            address: 'Test Address',
            latitude: undefined,
            longitude: undefined,
            hasEmergency: false,
            hasAmbulance: false,
            emergencyPhone: undefined,
            ambulancePhone: undefined
        };

        service.getMe().subscribe(clinic => {
            expect(clinic).toEqual(mockClinic);
        });

        const req = httpMock.expectOne(`${apiUrl}/me`);
        expect(req.request.method).toBe('GET');
        req.flush(mockClinic);
    });

    it('should update profile', () => {
        const updateRequest: ClinicUpdateRequestDTO = {
            fullName: 'Updated Name',
            clinicName: 'Updated Clinic'
        };

        const mockResponse: ClinicResponseDTO = {
            id: 1,
            fullName: 'Updated Name',
            email: 'clinic@test.com',
            phone: '12345678',
            birthDate: '1990-01-01',
            photo: undefined,
            clinicName: 'Updated Clinic',
            address: 'Test Address',
            latitude: undefined,
            longitude: undefined,
            hasEmergency: false,
            hasAmbulance: false,
            emergencyPhone: undefined,
            ambulancePhone: undefined
        };

        service.updateProfile(updateRequest).subscribe(clinic => {
            expect(clinic.fullName).toBe('Updated Name');
            expect(clinic.clinicName).toBe('Updated Clinic');
        });

        const req = httpMock.expectOne(`${apiUrl}/profile`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(updateRequest);
        req.flush(mockResponse);
    });
});
