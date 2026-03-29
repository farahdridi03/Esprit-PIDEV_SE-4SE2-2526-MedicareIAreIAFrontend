import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LaboratoryResponseDTO } from '../models/laboratory.model';

@Injectable({
  providedIn: 'root'
})
export class LaboratoryService {
  private apiUrl = 'http://localhost:8081/springsecurity/api/laboratories/me';

  constructor(private http: HttpClient) { }

  getMyLaboratory(): Observable<LaboratoryResponseDTO> {
    return this.http.get<LaboratoryResponseDTO>(this.apiUrl);
  }

  updateProfile(data: any): Observable<LaboratoryResponseDTO> {
    return this.http.put<LaboratoryResponseDTO>(`http://localhost:8081/springsecurity/api/laboratories/profile`, data);
  }
}
