import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { UserRequestDTO, UserResponseDTO } from '../models/user.model';
import { jwtDecode } from 'jwt-decode';

export interface UpdateProfileRequest {
    fullName: string;
    email: string;
    password?: string;
    profileImage?: string;
}

export interface UserProfile {
    id?: number;
    fullName?: string;
    email?: string;
    roles?: string[];
    pharmacyId?: number;
    [key: string]: any;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly baseUrlLegacy = 'http://localhost:8081/springsecurity/user';
    private readonly apiUrl = 'http://localhost:8081/springsecurity/api/users';
    
    private profileSubject = new BehaviorSubject<UserResponseDTO | null>(null);
    profile$ = this.profileSubject.asObservable();

    constructor(private http: HttpClient) { }

    updateProfile(request: UpdateProfileRequest & { role?: string }): Observable<any> {
        return this.http.put(`${this.apiUrl}/profile`, request);
    }

    updateUserProfile(id: number | string, profileData: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, profileData);
    }

    create(dto: UserRequestDTO): Observable<UserResponseDTO> {
        return this.http.post<UserResponseDTO>(this.apiUrl, dto);
    }

    getById(id: number): Observable<UserResponseDTO> {
        return this.http.get<UserResponseDTO>(`${this.apiUrl}/${id}`);
    }

    getAll(): Observable<UserResponseDTO[]> {
        return this.http.get<UserResponseDTO[]>(this.apiUrl);
    }

    update(id: number, dto: UserRequestDTO): Observable<UserResponseDTO> {
        return this.http.put<UserResponseDTO>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    toggleEnabled(id: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/toggle`, {});
    }

    getByRole(role: string): Observable<UserResponseDTO[]> {
        return this.http.get<UserResponseDTO[]>(`${this.apiUrl}/role/${role}`);
    }

    getProfile(): Observable<UserResponseDTO> {
        return this.http.get<UserResponseDTO>(`${this.baseUrlLegacy}/profile`).pipe(
            tap(user => {
                if (user) {
                    this.profileSubject.next(user);
                }
            }),
            catchError(err => {
                console.warn('[UserService] Profil API échoué ou non trouvé, passage au fallback JWT.', err.status);
                const fallback = this.buildProfileFromToken();
                if (fallback) {
                    this.profileSubject.next(fallback);
                    return of(fallback);
                }
                return of(null as any);
            })
        );
    }

    private buildProfileFromToken(): UserResponseDTO | null {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return null;
            const decoded: any = jwtDecode(token);
            const fullName =
                decoded.fullName ||
                decoded.fullname ||
                decoded.name ||
                (decoded.sub && decoded.sub.includes('@') ? decoded.sub.split('@')[0] : decoded.sub) ||
                'User';
            return {
                id: decoded.id || decoded.userId || 0,
                fullName,
                email: decoded.sub || decoded.email || '',
                role: decoded.role || '',
                enabled: true
            } as UserResponseDTO;
        } catch {
            return null;
        }
    }

    setProfile(partial: Partial<UserResponseDTO>): void {
        const current = this.profileSubject.getValue();
        if (current) {
            this.profileSubject.next({ ...current, ...partial });
        } else {
            const base = this.buildProfileFromToken();
            if (base) {
                this.profileSubject.next({ ...base, ...partial });
            }
        }
    }

    refreshProfile(): void {
        this.getProfile().subscribe();
    }

    changePassword(id: number | string, passwordData: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${id}/change-password`, passwordData);
    }
}
