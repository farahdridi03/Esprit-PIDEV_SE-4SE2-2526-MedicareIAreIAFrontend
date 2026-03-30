import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LabTestResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  laboratoryId: number;
  laboratoryName: string;
  category: string;
  testType: string;
  durationMinutes: number;
  genderSpecific: string;
  requiresAppointment: boolean;
  requiresFasting: boolean;
}

export interface LabTestRequest {
  name: string;
  category: string;
  testType: string;
  laboratoryId: number;
  price: number;
  durationMinutes?: number;
  description?: string;
  requiresFasting: boolean;
  requiresAppointment: boolean;
  genderSpecific: string;
}

@Injectable({ providedIn: 'root' })
export class LabTestService {

  private baseUrl =
    'http://localhost:8081/springsecurity/api/lab-tests';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
  }

  getAll(): Observable<LabTestResponse[]> {
  return this.http.get<LabTestResponse[]>(
    'http://localhost:8081/springsecurity/api/lab-tests',
    { headers: this.getHeaders() }
  );
}

  create(request: LabTestRequest): Observable<LabTestResponse> {
    return this.http.post<LabTestResponse>(
      this.baseUrl,
      request,
      { headers: this.getHeaders() }
    );
  }

  update(id: number, req: LabTestRequest): Observable<LabTestResponse> {
    return this.http.put<LabTestResponse>(
      `${this.baseUrl}/${id}`,
      req,
      { headers: this.getHeaders() }
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }
}
