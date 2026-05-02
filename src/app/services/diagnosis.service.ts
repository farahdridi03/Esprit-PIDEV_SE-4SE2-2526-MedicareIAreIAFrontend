import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Diagnosis } from '../models/medical-records.model';

@Injectable({
  providedIn: 'root'
})
export class DiagnosisService {
  private readonly apiUrl = 'http://localhost:8081/springsecurity/diagnosis';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Diagnosis[]> {
    return this.http.get<Diagnosis[]>(`${this.apiUrl}/all`);
  }

  add(diagnosis: Diagnosis): Observable<Diagnosis> {
    return this.http.post<Diagnosis>(`${this.apiUrl}/add`, diagnosis);
  }

  update(id: number, diagnosis: Diagnosis): Observable<Diagnosis> {
    return this.http.put<Diagnosis>(`${this.apiUrl}/update/${id}`, diagnosis);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
