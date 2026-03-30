import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientRequestDTO, PatientResponseDTO } from '../models/patient.model';

@Injectable({
    providedIn: 'root'
})
export class PatientService {
    private readonly apiUrl = 'http://localhost:8081/springsecurity/api/patients';

    constructor(private http: HttpClient) { }

    create(dto: PatientRequestDTO): Observable<PatientResponseDTO> {
        return this.http.post<PatientResponseDTO>(this.apiUrl, dto);
    }

    getById(id: number): Observable<PatientResponseDTO> {
        return this.http.get<PatientResponseDTO>(`${this.apiUrl}/${id}`);
    }

    getMe(): Observable<PatientResponseDTO> {
        return this.http.get<PatientResponseDTO>(`${this.apiUrl}/me`);
    }

    getMyPatients(): Observable<PatientResponseDTO[]> {
        return this.http.get<PatientResponseDTO[]>(`${this.apiUrl}/my-patients`);
    }

    getAll(): Observable<PatientResponseDTO[]> {
        return this.http.get<PatientResponseDTO[]>(this.apiUrl);
    }

    update(id: number, dto: PatientRequestDTO): Observable<PatientResponseDTO> {
        return this.http.put<PatientResponseDTO>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    toggleEnabled(id: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/toggle`, {});
    }

    updateProfile(dto: PatientRequestDTO): Observable<PatientResponseDTO> {
        return this.http.put<PatientResponseDTO>(`${this.apiUrl}/profile`, dto);
    }
}
