import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Batch,
  PharmacyStock,
  ReceiveBatchRequest,
  StockAlert,
  StockMovement,
  StockMovementRequest
} from '../models/stock.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = 'http://localhost:8081/springsecurity/api/stock';

  constructor(private http: HttpClient) {}

  getStockByPharmacyId(pharmacyId: number): Observable<PharmacyStock[]> {
    return this.http.get<PharmacyStock[]>(`${this.apiUrl}/pharmacy/${pharmacyId}`);
  }

  receiveBatch(request: ReceiveBatchRequest): Observable<Batch> {
    return this.http.post<Batch>(`${this.apiUrl}/batches/receive`, request);
  }

  getBatchesByStockId(stockId: number): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${this.apiUrl}/${stockId}/batches`);
  }

  addMovement(request: StockMovementRequest): Observable<StockMovement> {
    return this.http.post<StockMovement>(`${this.apiUrl}/movements`, request);
  }

  getMovementsByStockId(stockId: number): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(`${this.apiUrl}/${stockId}/movements`);
  }

  getAllOpenAlerts(): Observable<StockAlert[]> {
    return this.http.get<StockAlert[]>(`${this.apiUrl}/alerts/open`);
  }

  getOpenAlertsByStockId(stockId: number): Observable<StockAlert[]> {
    return this.http.get<StockAlert[]>(`${this.apiUrl}/${stockId}/alerts/open`);
  }

  resolveAlert(alertId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/alerts/${alertId}/resolve`, {});
  }

  getStockSummary(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/summary`);
  }

  searchProducts(keyword: string, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search`, {
      params: { keyword, page: page.toString(), size: size.toString() }
    });
  }
}
