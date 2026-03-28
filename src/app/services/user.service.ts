import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserRequestDTO, UserResponseDTO } from '../models/user.model';

export interface UpdateProfileRequest {
    fullName: string;
    email: string;
    password?: string;
}

// Ajout d'une interface utilisateur simple utilisée par getProfile
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

    constructor(private http: HttpClient) { }

    updateProfile(request: UpdateProfileRequest): Observable<any> {
        return this.http.put(`${this.baseUrlLegacy}/profile`, request);
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

    // Méthode ajoutée: récupère le profil de l'utilisateur courant
    getProfile(): Observable<UserProfile> {
        // Appel à l'endpoint legacy /profile
        return this.http.get<UserProfile>(`${this.baseUrlLegacy}/profile`);
    }
}
