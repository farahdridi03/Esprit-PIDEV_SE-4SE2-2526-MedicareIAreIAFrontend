import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PharmacyOrderRequestDTO,
  PharmacyOrderResponseDTO,
  UpdateOrderStatusDTO,
  CancelOrderDTO,
  RejectOrderDTO,
  PharmacyStatsDTO,
  ProductSalesStatsDTO,
  OrderAgingDTO,
  EscalationResultDTO
} from '../models/pharmacy-order.model';

@Injectable({
  providedIn: 'root'
})
export class PharmacyOrderService {
  private apiUrl = 'https://medicareaipi-cpb5b9gmfmgbaeg7.swedencentral-01.azurewebsites.net/springsecurity/api/pharmacy/orders';

  constructor(private http: HttpClient) {}

  createOrder(dto: PharmacyOrderRequestDTO): Observable<PharmacyOrderResponseDTO> {
    return this.http.post<PharmacyOrderResponseDTO>(this.apiUrl, dto);
  }

  getOrderById(id: number): Observable<PharmacyOrderResponseDTO> {
    return this.http.get<PharmacyOrderResponseDTO>(`${this.apiUrl}/${id}`);
  }

  getOrdersByPatient(patientId: number): Observable<PharmacyOrderResponseDTO[]> {
    return this.http.get<PharmacyOrderResponseDTO[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getOrdersByPharmacy(pharmacyId: number): Observable<PharmacyOrderResponseDTO[]> {
    return this.http.get<PharmacyOrderResponseDTO[]>(`${this.apiUrl}/pharmacy/${pharmacyId}`);
  }

  getOrdersByPharmacyAndStatus(pharmacyId: number, status: string): Observable<PharmacyOrderResponseDTO[]> {
    return this.http.get<PharmacyOrderResponseDTO[]>(`${this.apiUrl}/pharmacy/${pharmacyId}/filter`, {
      params: { status }
    });
  }

  updateOrderStatus(id: number, dto: UpdateOrderStatusDTO): Observable<PharmacyOrderResponseDTO> {
    return this.http.patch<PharmacyOrderResponseDTO>(`${this.apiUrl}/${id}/status`, dto);
  }

  cancelOrder(id: number, reason: string): Observable<PharmacyOrderResponseDTO> {
    const dto: CancelOrderDTO = { reason };
    return this.http.patch<PharmacyOrderResponseDTO>(`${this.apiUrl}/${id}/cancel`, dto);
  }

  rejectOrder(id: number, dto: RejectOrderDTO): Observable<PharmacyOrderResponseDTO> {
    return this.http.patch<PharmacyOrderResponseDTO>(`${this.apiUrl}/${id}/reject`, dto);
  }

  getPharmacyStats(pharmacyId: number): Observable<PharmacyStatsDTO> {
    return this.http.get<PharmacyStatsDTO>(`${this.apiUrl}/pharmacy/${pharmacyId}/stats`);
  }

  downloadInvoice(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/invoice`, { responseType: 'blob' });
  }

  getRoute(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/route`);
  }

  // Task 2 — JPQL stats ventes par produit pour une pharmacie
  getProductSalesStats(pharmacyId: number): Observable<ProductSalesStatsDTO[]> {
    return this.http.get<ProductSalesStatsDTO[]>(`${this.apiUrl}/pharmacy/${pharmacyId}/product-sales`);
  }

  // Task 3 — Keyword search : commandes par nom de pharmacie + statut
  searchByPharmacyNameAndStatus(pharmacyName: string, status: string): Observable<PharmacyOrderResponseDTO[]> {
    const params = new HttpParams().set('pharmacyName', pharmacyName).set('status', status);
    return this.http.get<PharmacyOrderResponseDTO[]>(`${this.apiUrl}/search`, { params });
  }

  // Advanced — JPQL Aging Report
  getOrdersAging(): Observable<OrderAgingDTO[]> {
    return this.http.get<OrderAgingDTO[]>(`${this.apiUrl}/admin/orders-aging`);
  }

  // Advanced — Manual escalation trigger
  triggerEscalation(): Observable<EscalationResultDTO> {
    return this.http.post<EscalationResultDTO>(`${this.apiUrl}/admin/trigger-escalation`, {});
  }
}
