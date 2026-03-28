import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly baseUrl = 'http://localhost:8081/springsecurity/api/admin';

  constructor(private http: HttpClient) { }

  getPendingPharmacists(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/pending-pharmacists`);
  }

  approvePharmacist(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/approve-pharmacist/${id}`, {});
  }

  rejectPharmacist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/reject-pharmacist/${id}`);
  }

  // ── Home Care Providers ──────────────────────────────────────────────

  getPendingProviders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/homecare/pending`);
  }

  approveProvider(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/homecare/approve/${id}`, {});
  }

  rejectProvider(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/homecare/reject/${id}`);
  }
}
