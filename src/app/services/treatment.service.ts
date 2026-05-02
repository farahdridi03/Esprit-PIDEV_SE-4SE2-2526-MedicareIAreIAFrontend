import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Treatment } from '../models/medical-records.model';

@Injectable({
  providedIn: 'root'
})
export class TreatmentService {
  private readonly apiUrl = 'http://localhost:8081/springsecurity/treatment';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Treatment[]> {
    return this.http.get<Treatment[]>(`${this.apiUrl}/all`);
  }

  add(treatment: Treatment): Observable<Treatment> {
    return this.http.post<Treatment>(`${this.apiUrl}/add`, treatment);
  }

  update(id: number, treatment: Treatment): Observable<Treatment> {
    return this.http.put<Treatment>(`${this.apiUrl}/update/${id}`, treatment);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
