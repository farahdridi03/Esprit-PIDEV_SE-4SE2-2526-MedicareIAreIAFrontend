import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductResponseDTO } from '../models/pharmacy.model';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private readonly apiUrl = 'http://localhost:8081/springsecurity/api/products';

    constructor(private http: HttpClient) { }

    getAllProducts(): Observable<ProductResponseDTO[]> {
        return this.http.get<ProductResponseDTO[]>(this.apiUrl);
    }

    searchProducts(name: string): Observable<ProductResponseDTO[]> {
        return this.http.get<ProductResponseDTO[]>(`${this.apiUrl}/search`, {
            params: { name }
        });
    }

    getProductById(id: number): Observable<ProductResponseDTO> {
        return this.http.get<ProductResponseDTO>(`${this.apiUrl}/${id}`);
    }
}
