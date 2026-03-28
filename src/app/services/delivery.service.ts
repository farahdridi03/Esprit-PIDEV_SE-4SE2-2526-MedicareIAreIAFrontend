import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Delivery, DeliveryStatus } from '../models/delivery.model';
import { DeliveryAgency, DeliveryAgent } from '../models/pharmacy.model';
@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private readonly baseUrl = 'http://localhost:8081/springsecurity/api/pharmacy/deliveries';

  constructor(private http: HttpClient) { }

  dispatchOrder(orderId: number, agentId: number): Observable<Delivery> {
    return this.http.post<Delivery>(`${this.baseUrl}/dispatch`, { orderId, agentId });
  }

  updateStatus(deliveryId: number, status: DeliveryStatus): Observable<Delivery> {
    return this.http.patch<Delivery>(`${this.baseUrl}/${deliveryId}/status?status=${status}`, {});
  }

  getDeliveryByOrderId(orderId: number): Observable<Delivery> {
    return this.http.get<Delivery>(`${this.baseUrl}/order/${orderId}`);
  }

  getDeliveryByTrackingNumber(trackingNumber: string): Observable<Delivery> {
    return this.http.get<Delivery>(`${this.baseUrl}/tracking/${trackingNumber}`);
  }

  getAgencies(): Observable<DeliveryAgency[]> {
    return this.http.get<DeliveryAgency[]>(`${this.baseUrl}/agencies`);
  }

  getAgentsByAgency(agencyId: number): Observable<DeliveryAgent[]> {
    return this.http.get<DeliveryAgent[]>(`${this.baseUrl}/agencies/${agencyId}/agents`);
  }

  getDeliveriesByAgent(agentId: number): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${this.baseUrl}/agent/${agentId}`);
  }

  assignAgent(deliveryId: number, agentId: number): Observable<Delivery> {
    return this.http.post<Delivery>(`${this.baseUrl}/${deliveryId}/assign/${agentId}`, {});
  }
}
