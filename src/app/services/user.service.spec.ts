import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService, UpdateProfileRequest, UserProfile } from './user.service';
import { UserRequestDTO, UserResponseDTO } from '../models/user.model';

describe('UserService', () => {
    let service: UserService;
    let httpMock: HttpTestingController;
    const baseUrlLegacy = 'http://localhost:8081/springsecurity/user';
    const apiUrl = 'http://localhost:8081/springsecurity/api/users';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [UserService]
        });
        service = TestBed.inject(UserService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should update profile via legacy endpoint', () => {
        const mockRequest: UpdateProfileRequest = { fullName: 'New Name', email: 'new@example.com' };
        service.updateProfile(mockRequest).subscribe(res => {
            expect(res).toBeTruthy();
        });

        const req = httpMock.expectOne(`${baseUrlLegacy}/profile`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(mockRequest);
        req.flush({ status: 'success' });
    });

    it('should create a new user', () => {
        const mockDto: UserRequestDTO = { fullName: 'Test', email: 'test@test.com', password: 'pwd', role: 'PATIENT' };
        const mockResponse: UserResponseDTO = { id: 1, ...mockDto, enabled: true };

        service.create(mockDto).subscribe(user => {
            expect(user.id).toBe(1);
            expect(user.email).toBe('test@test.com');
        });

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
    });

    it('should get user by id', () => {
        const mockResponse: UserResponseDTO = { id: 1, fullName: 'Test', email: 'test@test.com', role: 'PATIENT', enabled: true };

        service.getById(1).subscribe(user => {
            expect(user.id).toBe(1);
        });

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should get all users', () => {
        const mockResponse: UserResponseDTO[] = [{ id: 1, fullName: 'Test', email: 'test@test.com', role: 'PATIENT', enabled: true }];

        service.getAll().subscribe(users => {
            expect(users.length).toBe(1);
            expect(users[0].id).toBe(1);
        });

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should update user by id', () => {
        const mockDto: UserRequestDTO = { fullName: 'Updated', email: 'upd@test.com', password: 'pwd', role: 'PATIENT' };
        const mockResponse: UserResponseDTO = { id: 1, ...mockDto, enabled: true };

        service.update(1, mockDto).subscribe(user => {
            expect(user.fullName).toBe('Updated');
        });

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('PUT');
        req.flush(mockResponse);
    });

    it('should delete user by id', () => {
        service.delete(1).subscribe(res => {
            expect(res).toBeNull();
        });

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });

    it('should toggle user account status', () => {
        service.toggleEnabled(1).subscribe(res => {
            expect(res).toBeNull();
        });

        const req = httpMock.expectOne(`${apiUrl}/1/toggle`);
        expect(req.request.method).toBe('PATCH');
        req.flush(null);
    });

    it('should get users by role', () => {
        const mockResponse: UserResponseDTO[] = [{ id: 1, fullName: 'Doc', email: 'doc@test.com', role: 'DOCTOR', enabled: true }];

        service.getByRole('DOCTOR').subscribe(users => {
            expect(users.length).toBe(1);
        });

        const req = httpMock.expectOne(`${apiUrl}/role/DOCTOR`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should get current user profile', () => {
        const mockProfile: UserProfile = { id: 1, fullName: 'Aziz', email: 'aziz@test.com' };

        service.getProfile().subscribe(profile => {
            expect(profile.fullName).toBe('Aziz');
        });

        const req = httpMock.expectOne(`${baseUrlLegacy}/profile`);
        expect(req.request.method).toBe('GET');
        req.flush(mockProfile);
    });
});
