import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NutritionistRequestDTO, NutritionistResponseDTO } from '../models/nutritionist.model';

@Injectable({
    providedIn: 'root'
})
export class NutritionistService {
    private readonly apiUrl = 'http://localhost:8081/springsecurity/api/nutritionists';

    constructor(private http: HttpClient) { }

    getMe(): Observable<NutritionistResponseDTO> {
        return this.http.get<NutritionistResponseDTO>(`${this.apiUrl}/me`);
    }

    updateProfile(dto: NutritionistRequestDTO): Observable<NutritionistResponseDTO> {
        return this.http.put<NutritionistResponseDTO>(`${this.apiUrl}/profile`, dto);
    }
}
