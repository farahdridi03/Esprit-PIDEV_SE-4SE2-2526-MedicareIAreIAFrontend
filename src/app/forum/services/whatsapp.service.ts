import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WhatsAppAlertRequest {
  postId: number;
  postTitle: string;
  postContent: string;
  authorName: string;
  authorRole: string;
  targetRoles: string[]; // ex: ['DOCTOR', 'PHARMACIST']
}

export interface WhatsAppAlertResponse {
  sent: boolean;
  recipientCount: number;
  messageId?: string;
}

@Injectable({ providedIn: 'root' })
export class WhatsAppService {

  private base = `${environment.apiUrl}/api/forum/whatsapp`;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('auth_token') ||
                  JSON.parse(localStorage.getItem('currentUser') || '{}')?.token || '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  sendAlert(req: WhatsAppAlertRequest): Observable<WhatsAppAlertResponse> {
    return this.http.post<WhatsAppAlertResponse>(
      `${this.base}/alert`,
      req,
      { headers: this.headers() }
    );
  }

  getAlertStatus(postId: number): Observable<WhatsAppAlertResponse> {
    return this.http.get<WhatsAppAlertResponse>(
      `${this.base}/status/${postId}`,
      { headers: this.headers() }
    );
  }
}
