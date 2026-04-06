import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
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
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: response.id,
                        email: response.email,
                        role: response.role,
                        fullName: response.fullName,
                        token: response.token
                    }));
                    this.authStatusSubject.next(true);
                }
            })
        );
    }

    register(payload: RegisterRequest): Observable<string> {
        return this.http.post(
            `${this.baseUrl}/register`,
            payload,
            { responseType: 'text' }
        ) as Observable<string>;
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem('currentUser');
        this.authStatusSubject.next(false);
        this.router.navigate(['/auth/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    // ✅ Unified — now just uses the main User ID
    getPatientId(): number {
        return this.getUserId() || 0;
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
            let role: string | null = null;
            if (typeof decoded.role === 'string') {
                role = decoded.role;
            } else if (Array.isArray(decoded.role) && decoded.role.length > 0) {
                role = decoded.role[0];
            } else if (decoded.roles && Array.isArray(decoded.roles) && decoded.roles.length > 0) {
                role = decoded.roles[0];
            }
            if (!role && decoded.authorities && Array.isArray(decoded.authorities) && decoded.authorities.length > 0) {
                const first = decoded.authorities[0];
                role = typeof first === 'string' ? first : (first.authority || null);
            }
            if (!role) return null;
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
            return decoded.sub || decoded.email || null;
        } catch (error) {
            return null;
        }
    }

    getUserId(): number {
        const token = this.getToken();
        if (!token) return 1;

        try {
            const decoded: any = jwtDecode(token);
            const id = decoded.id || decoded.userId || decoded.providerId;
            return id ? Number(id) : 1;
        } catch (error) {
            return 1;
        }
    }

    getHomeCareServices(): Observable<any[]> {
        return this.http.get<any[]>(`http://localhost:8081/springsecurity/api/home-care-services`);
    }
    getUserFullName(): string | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            const decoded: any = jwtDecode(token);
            const name = decoded.fullName || decoded.fullname || decoded.name;
            if (name) return name;
            const sub = decoded.sub || decoded.email;
            if (sub && sub.includes('@')) {
                return sub.split('@')[0];
            }
            return sub || null;
        } catch (error) {
            return null;
        }
    }

    getUserGender(): string {
        const token = this.getToken();
        if (!token) return 'UNKNOWN';
        try {
            const decoded: any = jwtDecode(token);
            return decoded.gender || 'UNKNOWN';
        } catch (error) {
            return 'UNKNOWN';
        }
    }

    getParentRole(): { label: string; badge: string } {
        const gender = this.getUserGender();
        if (gender === 'FEMALE') {
            return { label: 'Maman', badge: 'MAMA' };
        } else if (gender === 'MALE') {
            return { label: 'Papa', badge: 'PAPA' };
        }
        return { label: 'Parent', badge: 'PARENT' };
    }

    forgotPassword(email: string): Observable<string> {
        return this.http.post(
            `${this.baseUrl}/forgot-password`,
            { email },
            { responseType: 'text' }
        ) as Observable<string>;
    }

    resetPassword(token: string, newPassword: string): Observable<string> {
        return this.http.post(
            `${this.baseUrl}/reset-password`,
            { token, newPassword },
            { responseType: 'text' }
        ) as Observable<string>;
    }

    getLaboratoryId(): number | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            const decoded: any = jwtDecode(token);
            return decoded.laboratoryId ?? null;
        } catch { return null; }
    }

    getFullName(): string | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            const decoded: any = jwtDecode(token);
            return decoded.fullName ?? null;
        } catch { return null; }
    }

    getRole(): string | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            const decoded: any = jwtDecode(token);
            return decoded.role ?? null;
        } catch { return null; }
    }
}
