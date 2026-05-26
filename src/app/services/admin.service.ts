import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

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
  private readonly homecareApiUrl = 'http://localhost:8081/springsecurity/api/homecare';

  getPendingProviders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.homecareApiUrl}/admin/providers`).pipe(
      map((data: any[]) => data.filter(p => !p.verified))
    );
  }


  approveProvider(id: number): Observable<any> {
    return this.http.put<any>(`${this.homecareApiUrl}/admin/providers/${id}/verify`, {});
  }

  rejectProvider(id: number): Observable<void> {
    return this.http.delete<void>(`${this.homecareApiUrl}/admin/providers/${id}/reject`);
  }

}
