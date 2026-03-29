import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('AuthInterceptor', () => {
    let httpMock: HttpTestingController;
    let httpClient: HttpClient;
    let authServiceSpy: jasmine.SpyObj<AuthService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('AuthService', ['getToken', 'logout']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: AuthInterceptor,
                    multi: true
                },
                { provide: AuthService, useValue: spy }
            ]
        });

        httpMock = TestBed.inject(HttpTestingController);
        httpClient = TestBed.inject(HttpClient);
        authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should add Authorization header when token exists and URL is not login/register', () => {
        authServiceSpy.getToken.and.returnValue('test-token-123');

        httpClient.get('/api/any-endpoint').subscribe();

        const req = httpMock.expectOne('/api/any-endpoint');
        expect(req.request.headers.has('Authorization')).toBeTrue();
        expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');
    });

    it('should NOT add Authorization header for login endpoint', () => {
        authServiceSpy.getToken.and.returnValue('test-token-123');

        httpClient.post('/auth/login', {}).subscribe();

        const req = httpMock.expectOne('/auth/login');
        expect(req.request.headers.has('Authorization')).toBeFalse();
    });

    it('should NOT add Authorization header for register endpoint', () => {
        authServiceSpy.getToken.and.returnValue('test-token-123');

        httpClient.post('/auth/register', {}).subscribe();

        const req = httpMock.expectOne('/auth/register');
        expect(req.request.headers.has('Authorization')).toBeFalse();
    });

    it('should call logout and throw error on 401 Unauthorized', () => {
        authServiceSpy.getToken.and.returnValue('test-token-123');

        httpClient.get('/api/secure').subscribe({
            next: () => fail('should have failed with 401'),
            error: (error) => {
                expect(error.status).toBe(401);
                expect(authServiceSpy.logout).toHaveBeenCalled();
            }
        });

        const req = httpMock.expectOne('/api/secure');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
});
