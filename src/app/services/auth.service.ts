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

    // Le backend renvoie du texte brut pour /register -> spécifier responseType: 'text'
    register(payload: RegisterRequest): Observable<string> {
        return this.http.post(`${this.baseUrl}/register`, payload, { responseType: 'text' }) as Observable<string>;
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        this.authStatusSubject.next(false);
        this.router.navigate(['/auth/login']);
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
            // Le rôle peut venir sous forme de chaîne ou de tableau
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

            // Supprimer le préfixe ROLE_ si présent
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

    getUserFullName(): string | null {
        const token = this.getToken();
        if (!token) return null;

        try {
            const decoded: any = jwtDecode(token);
            // Try common JWT claims for full name
            return decoded.fullName || decoded.name || decoded.full_name || decoded.sub || null;
        } catch (error) {
            return null;
        }
    }
}
