import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ClinicResponseDTO, ClinicUpdateRequestDTO } from '../models/clinic.model';

@Injectable({
  providedIn: 'root'
})
export class ClinicService {
  private apiUrl = 'http://localhost:8081/springsecurity/api/clinics';

  constructor(private http: HttpClient) {}

  getMe(): Observable<ClinicResponseDTO> {
    return this.http.get<ClinicResponseDTO>(`${this.apiUrl}/me`);
  }

  updateProfile(request: ClinicUpdateRequestDTO): Observable<ClinicResponseDTO> {
    return this.http.put<ClinicResponseDTO>(`${this.apiUrl}/profile`, request);
  }
}
