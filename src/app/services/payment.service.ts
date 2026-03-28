import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentRequestDTO, PaymentResponseDTO } from '../models/payment.model';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8081/springsecurity/api/pharmacy/payments';

  constructor(private http: HttpClient) { }

  initiatePayment(request: PaymentRequestDTO): Observable<PaymentResponseDTO> {
    return this.http.post<PaymentResponseDTO>(this.apiUrl, request);
  }

  getPaymentByOrderId(orderId: number): Observable<PaymentResponseDTO> {
    return this.http.get<PaymentResponseDTO>(`${this.apiUrl}/order/${orderId}`);
  }

  createPaymentIntent(orderId: number): Observable<PaymentResponseDTO> {
    return this.http.post<PaymentResponseDTO>(`${this.apiUrl}/create-payment-intent/${orderId}`, {});
  }

  verifyPayment(paymentId: number): Observable<PaymentResponseDTO> {
    return this.http.post<PaymentResponseDTO>(`${this.apiUrl}/verify/${paymentId}`, {});
  }
}
