import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prescription } from '../models/medical-records.model';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  private readonly apiUrl = 'http://localhost:8081/springsecurity/prescription';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.apiUrl}/all`);
  }

  add(prescription: Prescription): Observable<Prescription> {
    return this.http.post<Prescription>(`${this.apiUrl}/add`, prescription);
  }

  update(id: number, prescription: Prescription): Observable<Prescription> {
    return this.http.put<Prescription>(`${this.apiUrl}/update/${id}`, prescription);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
