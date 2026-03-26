import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Laboratory {
  id: number;
  name: string;
  address?: string;
  phone?: string;
}

export interface LabRequestPayload {
  patientId: number;
  laboratoryId: number;
  testType: string;
  scheduledAt: string;
  clinicalNotes: string;
  requestedBy: string;
  doctorId: null;
}

export interface LabRequestResponse {
  id: number;
  patientId: number;
  patientName: string;
  laboratoryId: number;
  laboratoryName: string;
  testType: string;
  status: string;
  scheduledAt: string;
  clinicalNotes: string;
  requestedBy: string;
}

@Injectable({ providedIn: 'root' })
export class LabRequestService {

  private base = '/springsecurity/api';

  constructor(private http: HttpClient) {}

  getLaboratories(): Observable<Laboratory[]> {
    return this.http.get<Laboratory[]>(`${this.base}/laboratories`);
  }

  create(payload: LabRequestPayload): Observable<LabRequestResponse> {
    return this.http.post<LabRequestResponse>(
      `${this.base}/lab-requests`, payload
    );
  }

  getByPatient(patientId: number): Observable<LabRequestResponse[]> {
    return this.http.get<LabRequestResponse[]>(
      `${this.base}/lab-requests/patient/${patientId}` 
    );
  }

  cancel(id: number): Observable<LabRequestResponse> {
    return this.http.patch<LabRequestResponse>(
      `${this.base}/lab-requests/${id}/cancel`, {}
    );
  }

  update(id: number, payload: LabRequestPayload): Observable<LabRequestResponse> {
    return this.http.put<LabRequestResponse>(`${this.base}/lab-requests/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/lab-requests/${id}`);
  }
}
