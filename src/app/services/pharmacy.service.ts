import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pharmacy, PharmacyRequest } from '../models/pharmacy.model';

@Injectable({
  providedIn: 'root'
})
export class PharmacyService {
  private apiUrl = 'http://localhost:8081/springsecurity/api/pharmacies';

  constructor(private http: HttpClient) {}

  getAllPharmacies(): Observable<Pharmacy[]> {
    return this.http.get<Pharmacy[]>(this.apiUrl);
  }

  getPharmacyById(id: number): Observable<Pharmacy> {
    return this.http.get<Pharmacy>(`${this.apiUrl}/${id}`);
  }

  createPharmacy(pharmacy: PharmacyRequest): Observable<Pharmacy> {
    return this.http.post<Pharmacy>(this.apiUrl, pharmacy);
  }

  updatePharmacy(id: number, pharmacy: PharmacyRequest): Observable<Pharmacy> {
    return this.http.put<Pharmacy>(`${this.apiUrl}/${id}`, pharmacy);
  }

  deletePharmacy(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
