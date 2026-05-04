import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, map, switchMap } from 'rxjs';
import { LaboratoryRequest, LaboratoryResponse } from '../models/laboratory.model';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

export interface LaboratoryRequestResponse {
  id: number;
  patientFullName: string;
  laboratoryName: string;
  testType: string;
  requestDate: string;
  scheduledAt: string;
  status: string;
  notes?: string;
  resultsUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class LaboratoryService {
  private baseUrl = `${environment.apiUrl}/api/laboratories`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAll(): Observable<LaboratoryResponse[]> {
    return this.http.get<LaboratoryResponse[]>(this.baseUrl, { headers: this.getHeaders() }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getActive(): Observable<LaboratoryResponse[]> {
    return this.http.get<LaboratoryResponse[]>(`${this.baseUrl}/active`, { headers: this.getHeaders() }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getById(id: number): Observable<LaboratoryResponse> {
    return this.http.get<LaboratoryResponse>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  searchByName(name: string): Observable<LaboratoryResponse[]> {
    return this.http.get<LaboratoryResponse[]>(
      `${this.baseUrl}/search?name=${encodeURIComponent(name)}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(err => throwError(() => err))
    );
  }

  create(data: LaboratoryRequest): Observable<LaboratoryResponse> {
    return this.http.post<LaboratoryResponse>(this.baseUrl, data, { headers: this.getHeaders() }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  update(id: number, data: LaboratoryRequest): Observable<LaboratoryResponse> {
    return this.http.put<LaboratoryResponse>(
      `${this.baseUrl}/${id}`, data, { headers: this.getHeaders() }
    ).pipe(
      catchError(err => throwError(() => err))
    );
  }

  toggleActive(id: number): Observable<LaboratoryResponse> {
    return this.http.patch<LaboratoryResponse>(
      `${this.baseUrl}/${id}/toggle-active`, {}, { headers: this.getHeaders() }
    ).pipe(
      catchError(err => throwError(() => err))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getMyLaboratory(): Observable<LaboratoryResponse> {
    const headers = this.getHeaders();
    
    // First try /me (standard for current user context)
    return this.http.get<LaboratoryResponse>(`${this.baseUrl}/me`, { headers }).pipe(
      // Fallback to /profile if /me fails
      catchError(() => this.http.get<LaboratoryResponse>(`${this.baseUrl}/profile`, { headers })),
      // Final fallback: search all and take first if available (for robustness)
      catchError(() => this.getAll().pipe(
        map(labs => {
          if (labs && labs.length > 0) return labs[0];
          throw new Error('Laboratory not found by any method');
        })
      )),
      catchError(err => throwError(() => err))
    );
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/profile`, data, { headers: this.getHeaders() }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getPatientRequests(): Observable<LaboratoryRequestResponse[]> {
    return this.http.get<LaboratoryRequestResponse[]>(`${this.baseUrl}/patient/requests`, { headers: this.getHeaders() }).pipe(
      catchError(err => throwError(() => err))
    );
  }
}

