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

    getUserId(): number | null {
        // Afficher le rôle de l'utilisateur pour débogage
        const userRole = this.getUserRole();
        console.log('🔍 getUserId: User role:', userRole);
        
        // Essayer d'abord de récupérer l'ID depuis localStorage (currentUser)
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            try {
                const user = JSON.parse(currentUser);
                console.log('🔍 getUserId: Found user in localStorage:', user);
                console.log('🔍 getUserId: user.id:', user.id);
                console.log('🔍 getUserId: typeof user.id:', typeof user.id);
                console.log('🔍 getUserId: user keys:', Object.keys(user));
                if (user.id !== undefined && user.id !== null) {
                    const userId = parseInt(user.id, 10);
                    if (!isNaN(userId)) {
                        console.log('🔍 getUserId: Using ID from localStorage:', userId);
                        return userId;
                    } else {
                        console.log('❌ getUserId: user.id is not a valid number:', user.id);
                    }
                } else {
                    console.log('❌ getUserId: user.id is undefined or null');
                }
            } catch (error) {
                console.log('❌ getUserId: Error parsing currentUser from localStorage:', error);
            }
        } else {
            console.log('❌ getUserId: No currentUser found in localStorage');
        }

        // Si pas dans localStorage, essayer le token JWT
        const token = this.getToken();
        if (!token) {
            console.log('❌ getUserId: No token found');
            return null;
        }
        try {
            const decoded: any = jwtDecode(token);
            console.log('🔍 getUserId: Token decoded:', decoded);
            console.log('🔍 getUserId: Looking for id in:', Object.keys(decoded));
            console.log('🔍 getUserId: decoded.id:', decoded.id);
            console.log('🔍 getUserId: decoded.sub:', decoded.sub);
            console.log('🔍 getUserId: decoded.userId:', decoded.userId);
            console.log('🔍 getUserId: decoded.user_id:', decoded.user_id);
            console.log('🔍 getUserId: decoded.name:', decoded.name);
            console.log('🔍 getUserId: decoded.email:', decoded.email);
            console.log('🔍 getUserId: decoded.role:', decoded.role);
            console.log('🔍 getUserId: decoded.fullName:', decoded.fullName);
            
            let userId: number | null = null;

            // Try to get ID from 'id' field first
            if (decoded.id !== undefined) {
                userId = parseInt(decoded.id, 10);
            } else if (decoded.sub && !isNaN(parseInt(decoded.sub, 10))) { // Try 'sub' if it's a number
                userId = parseInt(decoded.sub, 10);
            } else if (decoded.userId !== undefined) { // Try 'userId' field
                userId = parseInt(decoded.userId, 10);
            } else if (decoded.user_id !== undefined) { // Try 'user_id' field
                userId = parseInt(decoded.user_id, 10);
            }

            if (userId !== null && isNaN(userId)) {
                console.log('❌ getUserId: Extracted ID is not a valid number:', userId);
                return null;
            }
            
            console.log('🔍 getUserId: Final userId:', userId);
            return userId;
        } catch (error) {
            console.log('❌ getUserId: Error decoding token:', error);
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
}