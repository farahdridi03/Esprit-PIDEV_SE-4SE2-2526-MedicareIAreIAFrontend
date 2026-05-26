import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
<<<<<<< HEAD
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { MOCK_AUTH_RESPONSE, MOCK_TOKEN_PATIENT, MOCK_TOKEN_EXPIRED } from '../testing/mocks/auth.mock';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: spy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
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
      const loginPayload = { email: 'test@example.com', password: 'password' };
      
      service.login(loginPayload).subscribe(response => {
        expect(response).toEqual(MOCK_AUTH_RESPONSE);
        expect(localStorage.getItem('auth_token')).toBe(MOCK_AUTH_RESPONSE.token);
      });

      const req = httpMock.expectOne('http://localhost:8081/springsecurity/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(MOCK_AUTH_RESPONSE);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false if no token is present', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return true if a valid token is present', () => {
      localStorage.setItem('auth_token', MOCK_TOKEN_PATIENT);
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return false if the token is expired', () => {
      localStorage.setItem('auth_token', MOCK_TOKEN_EXPIRED);
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('getUserRole', () => {
    it('should return the correct role from token', () => {
      localStorage.setItem('auth_token', MOCK_TOKEN_PATIENT);
      expect(service.getUserRole()).toBe('PATIENT');
    });

    it('should return null if no token is present', () => {
      expect(service.getUserRole()).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear token and navigate to login', () => {
      localStorage.setItem('auth_token', 'some-token');
      service.logout();
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });
=======
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
>>>>>>> aziz
});
