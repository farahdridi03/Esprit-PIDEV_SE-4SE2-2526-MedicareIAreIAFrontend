import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LabAnalyticsDTO {
  laboratoryId: number;
  laboratoryName: string;
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completionRate: number;
  avgProcessingTimeHours: number;
  abnormalResults: number;
  abnormalRate: number;
  lastUpdated: string;
}

@Injectable({ providedIn: 'root' })
export class LabAnalyticsService {

  private base = '/springsecurity/api/lab-analytics';

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getStats(): Observable<LabAnalyticsDTO[]> {
    return this.http.get<LabAnalyticsDTO[]>(this.base, { headers: this.headers() });
  }

  forceRefresh(): Observable<LabAnalyticsDTO[]> {
    return this.http.get<LabAnalyticsDTO[]>(`${this.base}/refresh`, { headers: this.headers() });
  }
}
