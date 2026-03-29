import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthResponse } from '../models/auth-response.model';
import { LoginRequest } from '../models/login-request.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login and store token', () => {
      const mockRequest: LoginRequest = { email: 'test@test.com', password: 'password' };
      const mockResponse: AuthResponse = { token: 'mock-jwt-token', email: 'test@test.com', role: 'ADMIN' };

      service.login(mockRequest).subscribe(response => {
        expect(response.token).toBe('mock-jwt-token');
        expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token');
      });

      const req = httpMock.expectOne('http://localhost:8081/springsecurity/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('register', () => {
    it('should register and return message', () => {
      const mockRequest = { 
        email: 'new@test.com', 
        password: 'password', 
        fullName: 'New User',
        role: 'PATIENT' 
      };
      const mockResponse = 'User registered successfully';

      service.register(mockRequest as any).subscribe(response => {
        expect(response).toBe(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:8081/springsecurity/auth/register');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('token management', () => {
    it('should correctly handle token storage', () => {
      service.setToken('test-token');
      expect(service.getToken()).toBe('test-token');
      expect(localStorage.getItem('auth_token')).toBe('test-token');
    });

    it('should logout and clear token', () => {
      spyOn(router, 'navigate');
      service.setToken('test-token');
      service.logout();
      expect(service.getToken()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('verifyGoogleAuth', () => {
     it('should verify OTP and store token', () => {
         const mockEmail = 'test@gmail.com';
         const mockCode = '123456';
         const mockResponse: AuthResponse = { token: 'google-jwt-token', email: 'test@test.com', role: 'PHARMACIST' };

         service.verifyGoogleAuth(mockEmail, mockCode).subscribe(res => {
             expect(res.token).toBe('google-jwt-token');
             expect(localStorage.getItem('auth_token')).toBe('google-jwt-token');
         });

         const req = httpMock.expectOne('http://localhost:8081/springsecurity/auth/google/verify');
         expect(req.request.method).toBe('POST');
         expect(req.request.body).toEqual({ email: mockEmail, code: mockCode });
         req.flush(mockResponse);
     });
  });
});
