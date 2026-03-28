import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { AuthResponse } from '../models/auth-response.model';
import { LoginRequest } from '../models/login-request.model';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    const baseUrl = 'http://localhost:8081/springsecurity/auth';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [AuthService]
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
        localStorage.clear();
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('login', () => {
        it('should send login credentials and store token', () => {
            const credentials: LoginRequest = {
                email: 'test@example.com',
                password: 'password123'
            };

            const mockResponse: AuthResponse = {
                token: 'jwt-token-123',
                email: 'test@example.com',
                role: 'PATIENT'
            };

            service.login(credentials).subscribe(response => {
                expect(response.token).toBe('jwt-token-123');
                expect(response.email).toBe('test@example.com');
            });

            const req = httpMock.expectOne(`${baseUrl}/login`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(credentials);
            req.flush(mockResponse);
        });
    });

    describe('register', () => {
        it('should submit registration data as FormData', () => {
            const formData = new FormData();
            formData.append('email', 'new@example.com');
            formData.append('password', 'password123');

            service.register(formData).subscribe(response => {
                expect(response).toBe('User registered successfully');
            });

            const req = httpMock.expectOne(`${baseUrl}/register`);
            expect(req.request.method).toBe('POST');
            req.flush('User registered successfully');
        });
    });

    describe('logout', () => {
        it('should clear token', () => {
            localStorage.setItem('auth_token', 'test-token');

            service.logout();

            expect(localStorage.getItem('auth_token')).toBeNull();
        });
    });

    describe('getToken', () => {
        it('should return token from localStorage', () => {
            localStorage.setItem('auth_token', 'test-token');
            expect(service.getToken()).toBe('test-token');
        });

        it('should return null when token not in localStorage', () => {
            expect(service.getToken()).toBeNull();
        });
    });

    describe('isAuthenticated', () => {
        it('should return false when no token exists', () => {
            expect(service.isAuthenticated()).toBeFalsy();
        });
    });
});
