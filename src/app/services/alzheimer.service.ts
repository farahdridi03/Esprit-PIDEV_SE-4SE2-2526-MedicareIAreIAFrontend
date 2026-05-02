import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LabResultResponse } from './lab-result.service';

@Injectable({ providedIn: 'root' })
export class AlzheimerService {

  private baseUrl = 'http://localhost:8081/springsecurity/api/alzheimer';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  analyze(labRequestId: number, image: File, technicianName: string, doctorEmail: string): Observable<LabResultResponse> {
    const formData = new FormData();
    formData.append('image', image, image.name);
    formData.append('technicianName', technicianName);
    formData.append('doctorEmail', doctorEmail);

    return this.http.post<LabResultResponse>(
      `${this.baseUrl}/analyze/${labRequestId}`,
      formData,
      { headers: this.getAuthHeaders() }
    );
  }
}
