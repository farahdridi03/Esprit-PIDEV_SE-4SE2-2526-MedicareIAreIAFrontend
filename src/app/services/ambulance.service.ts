import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AmbulanceResponse {
  id: number;
  clinicId: number;
  currentLat: number;
  currentLng: number;
  licensePlate: string;
  status?: string;
}

export interface AmbulanceRequest {
  clinicId: number | null;
  currentLat: number | null;
  currentLng: number | null;
  licensePlate: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class AmbulanceService {
  private base = 'http://localhost:8081/springsecurity/api/ambulances';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AmbulanceResponse[]> {
    return this.http.get<AmbulanceResponse[]>(this.base);
  }

  getByClinic(clinicId: number): Observable<AmbulanceResponse[]> {
    return this.http.get<AmbulanceResponse[]>(`${this.base}/clinic/${clinicId}`);
  }

  create(dto: AmbulanceRequest): Observable<AmbulanceResponse> {
    return this.http.post<AmbulanceResponse>(this.base, dto);
  }

  update(id: number, dto: AmbulanceRequest): Observable<AmbulanceResponse> {
    return this.http.put<AmbulanceResponse>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

