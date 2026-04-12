import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const token = this.authService.getToken();

        const url = request.url;
        const isLogin = url.endsWith('/auth/login') || url.includes('/auth/login?') || url.endsWith('/login');
        const isRegister = url.endsWith('/auth/register') || url.includes('/auth/register?') || url.endsWith('/register');
        const isAuthUrl = isLogin || isRegister;

        if (token && !isAuthUrl) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                // Only force logout on 401/403 for authenticated requests (not on auth endpoints)
                if ((error.status === 401 || error.status === 403) && !isAuthUrl && token) {
                    this.authService.logout();
                }
                return throwError(() => error);
            })
        );
    }
}

// Note: Ensure that the Spring Boot backend allows CORS from http://localhost:4200
// and that the context path used here (/springsecurity) matches the backend.
