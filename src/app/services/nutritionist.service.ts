import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NutritionistRequestDTO, NutritionistResponseDTO } from '../models/nutritionist.model';

@Injectable({
    providedIn: 'root'
})
export class NutritionistService {
    private readonly apiUrl = 'https://medicareaipi-cpb5b9gmfmgbaeg7.swedencentral-01.azurewebsites.net/springsecurity/api/nutritionists';

    constructor(private http: HttpClient) { }

    getMe(): Observable<NutritionistResponseDTO> {
        return this.http.get<NutritionistResponseDTO>(`${this.apiUrl}/me`);
    }

    updateProfile(dto: NutritionistRequestDTO): Observable<NutritionistResponseDTO> {
        return this.http.put<NutritionistResponseDTO>(`${this.apiUrl}/profile`, dto);
    }
}
