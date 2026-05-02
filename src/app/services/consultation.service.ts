import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Consultation } from '../models/medical-records.model';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private readonly apiUrl = 'http://localhost:8081/springsecurity/consultation';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(`${this.apiUrl}/all`);
  }

  add(consultation: Consultation): Observable<Consultation> {
    return this.http.post<Consultation>(`${this.apiUrl}/add`, consultation);
  }

  update(id: number, consultation: Consultation): Observable<Consultation> {
    return this.http.put<Consultation>(`${this.apiUrl}/update/${id}`, consultation);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
