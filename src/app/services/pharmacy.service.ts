import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PharmacyResponseDTO, PharmacyStockResponseDTO } from '../models/pharmacy.model';
import { Pharmacy, PharmacyRequest } from '../models/pharmacy.model';

@Injectable({
  providedIn: 'root'
})
export class PharmacyService {
  private readonly apiUrl = 'http://localhost:8081/springsecurity/api/pharmacy/pharmacies';

  constructor(private http: HttpClient) { }

  getAllPharmacies(): Observable<PharmacyResponseDTO[]> {
    return this.http.get<PharmacyResponseDTO[]>(this.apiUrl);
  }

  getPharmacyById(id: number): Observable<PharmacyResponseDTO> {
    return this.http.get<PharmacyResponseDTO>(`${this.apiUrl}/${id}`);
  }

  searchPharmacies(name: string): Observable<PharmacyResponseDTO[]> {
    return this.http.get<PharmacyResponseDTO[]>(`${this.apiUrl}/search`, {
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

    return this.http.get<PharmacyStockResponseDTO[]>(`${this.apiUrl}/search/product`, { params });
  }

  searchByProducts(productIds: number[], minQty: number = 1): Observable<PharmacyStockResponseDTO[]> {
    const params = new HttpParams()
      .set('productIds', productIds.join(','))
      .set('minQty', minQty.toString());

    return this.http.get<PharmacyStockResponseDTO[]>(`${this.apiUrl}/search/batch`, { params });
  }

  deletePharmacy(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updatePharmacy(id: number, pharmacy: PharmacyRequest): Observable<Pharmacy> {
    return this.http.put<Pharmacy>(`${this.apiUrl}/${id}`, pharmacy);
  }

  createPharmacy(pharmacy: PharmacyRequest): Observable<Pharmacy> {
    return this.http.post<Pharmacy>(this.apiUrl, pharmacy);
  }
}
