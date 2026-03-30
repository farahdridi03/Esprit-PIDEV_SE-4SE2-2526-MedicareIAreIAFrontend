import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LabResultResponse {
  id: number;
  labRequestId: number;
  patientName: string;
  laboratoryName: string;
  testType: string;
  resultData: string;
  technicianName: string;
  verifiedBy: string;
  abnormalFindings: string;
  status: string;
  isAbnormal: boolean;
  completedAt: string;
  verifiedAt: string;
}

export interface LabResultRequest {
  labRequestId: number;
  resultData: string;
  technicianName: string;
  verifiedBy?: string;
  isAbnormal: boolean;
  abnormalFindings?: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class LabResultService {
  private baseUrl = 'http://localhost:8081/springsecurity/api/lab-results';
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
  }

  getAll(): Observable<LabResultResponse[]> {
    return this.http.get<LabResultResponse[]>(this.baseUrl, { headers: this.getHeaders() });
  }
  create(req: LabResultRequest): Observable<LabResultResponse> {
    return this.http.post<LabResultResponse>(this.baseUrl, req, { headers: this.getHeaders() });
  }
  update(id: number, req: LabResultRequest): Observable<LabResultResponse> {
    return this.http.put<LabResultResponse>(`${this.baseUrl}/${id}`, req, { headers: this.getHeaders() });
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }
}
