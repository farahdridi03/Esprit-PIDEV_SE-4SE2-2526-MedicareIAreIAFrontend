import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pharmacy, PharmacyRequest, PharmacyResponseDTO, PharmacyStockResponseDTO } from '../models/pharmacy.model';

@Injectable({
  providedIn: 'root'
})
export class PharmacyService {
  private readonly apiUrl = 'http://localhost:8081/springsecurity/api/pharmacies';
  private readonly searchApiUrl = 'http://localhost:8081/springsecurity/api/pharmacy/pharmacies';

  constructor(private http: HttpClient) {}

  getAllPharmacies(): Observable<Pharmacy[]> {
    return this.http.get<Pharmacy[]>(this.apiUrl);
  }

  getPharmacyById(id: number): Observable<Pharmacy> {
    return this.http.get<Pharmacy>(`${this.apiUrl}/${id}`);
  }

  searchPharmacies(name: string): Observable<PharmacyResponseDTO[]> {
    return this.http.get<PharmacyResponseDTO[]>(`${this.searchApiUrl}/search`, {
      params: { name }
    });
  }

  searchByProduct(productId: number, city?: string, minQty: number = 1): Observable<PharmacyStockResponseDTO[]> {
    let params = new HttpParams()
      .set('productId', productId.toString())
      .set('minQty', minQty.toString());

    if (city) {
      params = params.set('city', city);
    }

    return this.http.get<PharmacyStockResponseDTO[]>(`${this.searchApiUrl}/search/product`, { params });
  }

  searchByProducts(productIds: number[], minQty: number = 1): Observable<PharmacyStockResponseDTO[]> {
    const params = new HttpParams()
      .set('productIds', productIds.join(','))
      .set('minQty', minQty.toString());

    return this.http.get<PharmacyStockResponseDTO[]>(`${this.searchApiUrl}/search/batch`, { params });
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
