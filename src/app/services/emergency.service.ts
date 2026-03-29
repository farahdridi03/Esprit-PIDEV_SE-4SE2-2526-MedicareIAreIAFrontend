import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmergencyAlertResponse {
  id: number;
  smartDeviceId: number;
  patientName: string;
  emergencyPhone?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'ACKNOWLEDGED' | 'CLINIC_NOTIFIED' | 'RESOLVED' | 'CANCELED';
  latitude: number;
  longitude: number;
  canceledByPatient: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class EmergencyService {
  private base = 'http://localhost:8081/springsecurity/api';

  constructor(private http: HttpClient) {}

  getAllAlerts(): Observable<EmergencyAlertResponse[]> {
    return this.http.get<EmergencyAlertResponse[]>(`${this.base}/emergency-alerts`);
  }

  getAlertsByStatus(status: string): Observable<EmergencyAlertResponse[]> {
    return this.http.get<EmergencyAlertResponse[]>(`${this.base}/emergency-alerts/status/${status}`);
  }

  updateAlertStatus(id: number, status: string): Observable<EmergencyAlertResponse> {
    return this.http.put<EmergencyAlertResponse>(`${this.base}/emergency-alerts/${id}/status?status=${status}`, {});
  }

  cancelAlert(id: number): Observable<EmergencyAlertResponse> {
    return this.http.put<EmergencyAlertResponse>(`${this.base}/emergency-alerts/${id}/cancel`, {});
  }

  createAlert(alert: EmergencyAlertRequest): Observable<EmergencyAlertResponse> {
    return this.http.post<EmergencyAlertResponse>(`${this.base}/emergency-alerts`, alert);
  }

  dispatchIntervention(request: EmergencyInterventionRequest): Observable<EmergencyInterventionResponse> {
    return this.http.post<EmergencyInterventionResponse>(`${this.base}/interventions`, request);
  }

  getInterventionsByClinic(clinicId: number): Observable<EmergencyInterventionResponse[]> {
    return this.http.get<EmergencyInterventionResponse[]>(`${this.base}/interventions/clinic/${clinicId}`);
  }
}

export interface EmergencyAlertRequest {
  smartDeviceId: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  latitude: number;
  longitude: number;
  emergencyPhone?: string;
}

export interface EmergencyInterventionRequest {
  emergencyAlertId: number;
  clinicId: number;
  ambulanceId: number;
}

export interface EmergencyInterventionResponse {
  id: number;
  emergencyAlertId: number;
  clinicId: number;
  ambulanceId: number;
  patientName: string;
  status: string;
  dispatchedAt: string;
  arrivedAt?: string;
  completedAt?: string;
}
