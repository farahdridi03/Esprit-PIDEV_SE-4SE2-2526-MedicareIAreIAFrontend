import { Injector, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private injector: Injector) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const authService = this.injector.get(AuthService);
        const router = this.injector.get(Router);
        const token = authService.getToken();

        // Exclure strictement les endpoints de login/register pour éviter d'envoyer le header sur ces routes
        const url = request.url;
        const isLogin = url.endsWith('/auth/login') || url.includes('/auth/login?') || url.endsWith('/login');
        const isRegister = url.endsWith('/auth/register') || url.includes('/auth/register?') || url.endsWith('/register');
        const isGoogleVerify = url.endsWith('/google/verify') || url.includes('/google/verify?');
        const isAuthUrl = isLogin || isRegister || isGoogleVerify;

        if (token && !isAuthUrl) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401 || error.status === 403) {
                    // Déconnecter l'utilisateur et forcer redirection vers /login
                    authService.logout();
                    router.navigate(['/login']);
                }
                return throwError(() => error);
            })
        );
    }
}

// Note: Assurez-vous que le backend Spring Boot autorise les CORS depuis http://localhost:4200
// et que le context path utilisé ici (/springsecurity) correspond bien au backend.
