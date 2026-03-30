import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicalEvent, EventType } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private baseUrl = 'http://localhost:8081/springsecurity/api/events';

  constructor(private http: HttpClient) { }

  getAllEvents(): Observable<MedicalEvent[]> {
    return this.http.get<MedicalEvent[]>(this.baseUrl);
  }

  getEventById(id: number): Observable<MedicalEvent> {
    return this.http.get<MedicalEvent>(`${this.baseUrl}/${id}`);
  }

  getPublicEventById(id: number): Observable<MedicalEvent> {
    return this.http.get<MedicalEvent>(`${this.baseUrl}/public/${id}`);
  }

  getUpcomingEvents(): Observable<MedicalEvent[]> {
    return this.http.get<MedicalEvent[]>(`${this.baseUrl}/upcoming`);
  }

  getEventsByType(type: EventType): Observable<MedicalEvent[]> {
    return this.http.get<MedicalEvent[]>(`${this.baseUrl}/type/${type}`);
  }

  createEvent(event: any): Observable<MedicalEvent> {
    return this.http.post<MedicalEvent>(this.baseUrl, event);
  }

  updateEvent(id: number, event: any): Observable<MedicalEvent> {
    return this.http.put<MedicalEvent>(`${this.baseUrl}/${id}`, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  participateInEvent(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/participate`, {});
  }

  cancelParticipation(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/cancel-participation`);
  }

  isParticipating(id: number): Observable<{participating: boolean}> {
    return this.http.get<{participating: boolean}>(`${this.baseUrl}/${id}/is-participating`);
  }

  acceptParticipation(participationId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/participation/${participationId}/accept`, {});
  }

  rejectParticipation(participationId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/participation/${participationId}/reject`, {});
  }
}
