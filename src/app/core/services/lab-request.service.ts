import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LabRequestResponse {
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

  private baseUrl = 
    'https://app-backend-medicareai-bvgteze4eugsdpgu.swedencentral-01.azurewebsites.net/springsecurity/api/lab-requests';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
  }

  getPendingByLaboratory(labId: number): 
      Observable<LabRequestResponse[]> {
    return this.http.get<LabRequestResponse[]>(
      `${this.baseUrl}/laboratory/${labId}/pending`,
      { headers: this.getHeaders() }
    );
  }
}
