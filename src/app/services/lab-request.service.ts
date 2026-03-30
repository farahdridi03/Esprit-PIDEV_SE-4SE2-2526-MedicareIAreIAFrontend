import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Laboratory {
  id: number;
  name: string;
}

export interface LaboratoryRaw {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string | null;
  openingHours: string | null;
  specializations: string | null;
  active: boolean;
  totalStaff: number;
  totalTests: number;
}

export interface LabRequestPayload {
  patientId: number;
  doctorId: number | null;
  laboratoryId: number;
  requestedBy: string;
  testType: string;
  clinicalNotes: string;
  scheduledAt: string;
}

export interface LabRequestResponse {
  id: number;
  patientId: number;
  patientName: string;
  laboratoryId: number;
  laboratoryName: string;
  testType: string;
  status: string;
  clinicalNotes: string;
  scheduledAt: string;
  requestedAt: string;
}

export interface LabRequestResponseForLabStaff {
  id: number;
  patientId: number;
  patientName: string;
  laboratoryId: number;
  laboratoryName: string;
  testType: string;
  status: string;
  clinicalNotes: string;
  requestedAt: string;
}

@Injectable({ providedIn: 'root' })
export class LabRequestService {

  private base = '/springsecurity/api';

  constructor(private http: HttpClient) {}

  getLaboratories(): Observable<Laboratory[]> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
    return this.http
      .get<LaboratoryRaw[]>(`${this.base}/laboratories`, { headers })
      .pipe(map(labs => labs.map(l => ({ id: l.id, name: l.name }))));
  }

  create(payload: LabRequestPayload): Observable<LabRequestResponse> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
    return this.http.post<LabRequestResponse>(`${this.base}/lab-requests`, payload, { headers });
  }

  update(id: number, payload: LabRequestPayload): Observable<LabRequestResponse> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
    return this.http.put<LabRequestResponse>(`${this.base}/lab-requests/${id}`, payload, { headers });
  }

  delete(id: number): Observable<void> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
    return this.http.delete<void>(`${this.base}/lab-requests/${id}`, { headers });
  }

  getById(id: number): Observable<LabRequestResponse> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
    return this.http.get<LabRequestResponse>(`${this.base}/lab-requests/${id}`, { headers });
  }

  getAll(): Observable<LabRequestResponse[]> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
    return this.http.get<LabRequestResponse[]>(`${this.base}/lab-requests`, { headers });
  }

  getByPatient(patientId: number): Observable<LabRequestResponse[]> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
    return this.http.get<LabRequestResponse[]>(
      `${this.base}/lab-requests/patient/${patientId}`,
      { headers }
    );
  }

  cancel(id: number): Observable<LabRequestResponse> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
    return this.http.patch<LabRequestResponse>(`${this.base}/lab-requests/${id}/cancel`, {}, { headers });
  }

  updateStatus(id: number, status: string): Observable<LabRequestResponse> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
    return this.http.patch<LabRequestResponse>(
      `${this.base}/lab-requests/${id}/status`,
      null,
      { headers, params: { status } }
    );
  }

  getAllPending(): Observable<LabRequestResponse[]> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
    return this.http.get<LabRequestResponse[]>(
      'http://localhost:8081/springsecurity/api/lab-requests/status/PENDING',
      { headers }
    );
  }

  getPendingByLaboratory(laboratoryId: number): Observable<LabRequestResponse[]> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
    return this.http.get<LabRequestResponse[]>(
      `${this.base}/lab-requests/laboratory/${laboratoryId}/pending`,
      { headers }
    );
  }
}