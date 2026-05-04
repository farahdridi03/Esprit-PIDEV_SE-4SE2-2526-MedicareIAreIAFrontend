import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  aiDiagnostic?: string;
  aiRisk?: string;
  aiConfidence?: number;
  aiAlertSent?: boolean;
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
  private baseUrl = `${environment.apiUrl}/api/lab-results`;
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

  getByLaboratory(laboratoryId: number): Observable<LabResultResponse[]> {
    return this.http.get<LabResultResponse[]>(`${this.baseUrl}/laboratory/${laboratoryId}`, { headers: this.getHeaders() });
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

  getPatientAlzheimerHistory(patientName: string): Observable<LabResultResponse[]> {
    const encoded = encodeURIComponent(patientName);
    return this.http.get<LabResultResponse[]>(
      `${this.baseUrl}/patient-history/${encoded}`,
      { headers: this.getHeaders() }
    );
  }

  getAlzheimerPatients(): Observable<AlzheimerPatientSummary[]> {
    return this.http.get<AlzheimerPatientSummary[]>(
      `${this.baseUrl}/alzheimer-patients`,
      { headers: this.getHeaders() }
    );
  }
}

export interface AlzheimerPatientSummary {
  patientName: string;
  lastRisk: string;
  totalAnalyses: number;
  lastAnalysisDate: string;
}
