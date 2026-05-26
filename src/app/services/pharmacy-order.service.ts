import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  PharmacyOrderRequestDTO, 
  PharmacyOrderResponseDTO,
  UpdateOrderStatusDTO,
  CancelOrderDTO,
  RejectOrderDTO,
  PharmacyStatsDTO
} from '../models/pharmacy-order.model';

@Injectable({
  providedIn: 'root'
})
export class PharmacyOrderService {
  private apiUrl = 'http://localhost:8081/springsecurity/api/pharmacy/orders';

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
}
