import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicalRecord } from '../models/medical-records.model';

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordService {
  private readonly apiUrl = 'http://localhost:8081/springsecurity/medical-record';

  constructor(private http: HttpClient) { }

  getAll(): Observable<MedicalRecord[]> {
    return this.http.get<MedicalRecord[]>(`${this.apiUrl}/all`);
  }

  add(payload: any): Observable<MedicalRecord> {
    return this.http.post<MedicalRecord>(`${this.apiUrl}/add`, payload);
  }

  // Fallback endpoint if needed
  getById(id: number): Observable<MedicalRecord> {
    return this.http.get<MedicalRecord>(`${this.apiUrl}/get/${id}`);
  }

  getByPatientId(patientId: number): Observable<MedicalRecord> {
    return this.http.get<MedicalRecord>(`${this.apiUrl}/patient/${patientId}`);
  }
}
