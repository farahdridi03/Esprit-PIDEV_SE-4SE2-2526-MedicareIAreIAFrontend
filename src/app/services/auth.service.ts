import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
// jwt-decode 4.x uses named export
import { jwtDecode } from 'jwt-decode';
import { AuthResponse } from '../models/auth-response.model';
import { LoginRequest } from '../models/login-request.model';
import { RegisterRequest } from '../models/register-request.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly baseUrl = 'http://localhost:8081/springsecurity/auth';
    private readonly TOKEN_KEY = 'auth_token';

    private authStatusSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
    public authStatus$ = this.authStatusSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) { }

    login(payload: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
            tap(response => {
                if (response && response.token) {
                    localStorage.setItem(this.TOKEN_KEY, response.token);
                    this.authStatusSubject.next(true);
                }
            })
        );
    }

    // The backend now expects multipart/form-data
    register(formData: FormData): Observable<string> {
        return this.http.post(`${this.baseUrl}/register`, formData, { responseType: 'text' }) as Observable<string>;
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        this.authStatusSubject.next(false);
        this.router.navigate(['/front']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            const decoded: any = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp > currentTime;
        } catch (error) {
            return false;
        }
    }

    getUserRole(): string | null {
        const token = this.getToken();
        if (!token) return null;

        try {
            const decoded: any = jwtDecode(token);
            // The role may come as a string or array
            let role: string | null = null;
            if (typeof decoded.role === 'string') {
                role = decoded.role;
            } else if (Array.isArray(decoded.role) && decoded.role.length > 0) {
                role = decoded.role[0];
            } else if (decoded.roles && Array.isArray(decoded.roles) && decoded.roles.length > 0) {
                role = decoded.roles[0];
            }

            if (!role && decoded.authorities && Array.isArray(decoded.authorities) && decoded.authorities.length > 0) {
                // parfois Spring Security met les authorities
                const first = decoded.authorities[0];
                role = typeof first === 'string' ? first : (first.authority || null);
            }

            if (!role) return null;

            // Remove ROLE_ prefix if present
            return role.replace(/^ROLE_/, '');
        } catch (error) {
            return null;
        }
    }

    getUserEmail(): string | null {
        const token = this.getToken();
        if (!token) return null;

        try {
            const decoded: any = jwtDecode(token);
            // Typically Spring Security puts the username (email) in 'sub'
            return decoded.sub || decoded.email || null;
        } catch (error) {
            return null;
        }
    }

    getUserId(): number | null {
        const token = this.getToken();
        if (!token) return null;

        try {
            const decoded: any = jwtDecode(token);
            if (decoded.id) return decoded.id;
            if (decoded.userId) return decoded.userId;
            return null;
        } catch (error) {
            return null;
        }
    }

    // Added method: attempts to extract full user name from JWT token
    getUserFullName(): string | null {
        const token = this.getToken();
        if (!token) return null;

        try {
            const decoded: any = jwtDecode(token);
            // Chercher dans plusieurs champs possibles
            const possible = decoded.fullName || decoded.name || decoded.username || decoded.preferred_username || null;
            if (possible && typeof possible === 'string') return possible;

            // Sometimes first/last names are separated
            if (decoded.firstName || decoded.lastName) {
                return `${decoded.firstName || ''} ${decoded.lastName || ''}`.trim();
            }

            return null;
        } catch (error) {
            return null;
        }
    }
}
