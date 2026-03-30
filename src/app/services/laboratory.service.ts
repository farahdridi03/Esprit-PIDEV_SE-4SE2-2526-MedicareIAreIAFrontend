import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { LaboratoryRequest, LaboratoryResponse } from '../models/laboratory.model';

@Injectable({ providedIn: 'root' })
export class LaboratoryService {
private baseUrl = 'http://localhost:8081/springsecurity/api/laboratories';

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  constructor(private http: HttpClient) {}

  getAll(): Observable<LaboratoryResponse[]> {
    return this.http.get<LaboratoryResponse[]>(this.baseUrl, { headers: this.headers }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getActive(): Observable<LaboratoryResponse[]> {
    return this.http.get<LaboratoryResponse[]>(`${this.baseUrl}/active`, { headers: this.headers }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getById(id: number): Observable<LaboratoryResponse> {
    return this.http.get<LaboratoryResponse>(`${this.baseUrl}/${id}`, { headers: this.headers }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  searchByName(name: string): Observable<LaboratoryResponse[]> {
    return this.http.get<LaboratoryResponse[]>(
      `${this.baseUrl}/search?name=${encodeURIComponent(name)}`,
      { headers: this.headers }
    ).pipe(
      catchError(err => throwError(() => err))
    );
  }

  create(data: LaboratoryRequest): Observable<LaboratoryResponse> {
    return this.http.post<LaboratoryResponse>(this.baseUrl, data, { headers: this.headers }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  update(id: number, data: LaboratoryRequest): Observable<LaboratoryResponse> {
    return this.http.put<LaboratoryResponse>(
      `${this.baseUrl}/${id}`, data, { headers: this.headers }
    ).pipe(
      catchError(err => throwError(() => err))
    );
  }

  toggleActive(id: number): Observable<LaboratoryResponse> {
    return this.http.patch<LaboratoryResponse>(
      `${this.baseUrl}/${id}/toggle-active`, {}, { headers: this.headers }
    ).pipe(
      catchError(err => throwError(() => err))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.headers }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getMyLaboratory(): Observable<LaboratoryResponse> {
    return this.http.get<LaboratoryResponse>(`${this.baseUrl}/me`, { headers: this.headers }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/profile`, data, { headers: this.headers }).pipe(
      catchError(err => throwError(() => err))
    );
  }
}

