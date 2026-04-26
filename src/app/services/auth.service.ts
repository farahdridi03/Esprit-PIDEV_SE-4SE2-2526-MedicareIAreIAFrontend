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
    private readonly pharmacistUrl = 'http://localhost:8081/springsecurity/api/pharmacist';
    private readonly TOKEN_KEY = 'auth_token';
    private authStatusSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
    public authStatus$ = this.authStatusSubject.asObservable();
    
    private pharmacistProfileSubject = new BehaviorSubject<any>(null);
    public pharmacistProfile$ = this.pharmacistProfileSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) { 
        setTimeout(() => {
            if (this.isAuthenticated() && this.getUserRole() === 'PHARMACIST') {
                this.loadPharmacistProfile().subscribe({
                    error: (err) => console.error('Failed to load profile early', err)
                });
            }
        });
    }

    loadPharmacistProfile(): Observable<any> {
        return this.http.get<any>(`${this.pharmacistUrl}/me`).pipe(
            tap(profile => this.pharmacistProfileSubject.next(profile))
        );
    }

    setupPharmacy(formData: FormData): Observable<any> {
        return this.http.post(`${this.pharmacistUrl}/setup-pharmacy`, formData).pipe(
            tap(() => this.loadPharmacistProfile().subscribe())
        );
    }

    login(payload: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
            tap(response => {
                if (response && response.token) {
                    localStorage.setItem(this.TOKEN_KEY, response.token);
                    this.authStatusSubject.next(true);
                    if (this.getUserRole() === 'PHARMACIST') {
                        this.loadPharmacistProfile().subscribe();
                    }
                }
            })
        );
    }

    register(payload: RegisterRequest): Observable<string> {
        const formData = new FormData();
        formData.append('user', JSON.stringify(payload));
        
        // Handle potential file from payload if it exists (e.g. Base64 conversion or File object)
        // For now, mapping payload inside `user` string as the backend expects `multipart/form-data`
        return this.http.post(
            `${this.baseUrl}/register`,
            formData,
            { responseType: 'text' }
        ) as Observable<string>;
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        this.authStatusSubject.next(false);
        this.router.navigate(['/auth/login']);
    }

    setToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
        this.authStatusSubject.next(true);
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

    getHomeCareServices(): Observable<any[]> {
        return this.http.get<any[]>(
            `http://localhost:8081/springsecurity/api/home-care-services`
        );
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

    // ✅ Forgot Password
    forgotPassword(email: string): Observable<string> {
        return this.http.post(
            `${this.baseUrl}/forgot-password`,
            { email },
            { responseType: 'text' }
        ) as Observable<string>;
    }

    // ✅ Reset Password
    resetPassword(token: string, newPassword: string): Observable<string> {
        return this.http.post(
            `${this.baseUrl}/reset-password`,
            { token, newPassword },
            { responseType: 'text' }
        ) as Observable<string>;
    }

    // ✅ Google Verification
    verifyGoogleAuth(email: string, code: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.baseUrl}/google/verify`, { email, code }).pipe(
            tap(response => {
                if (response && response.token) {
                    this.setToken(response.token);
                }
            })
        );
    }
}