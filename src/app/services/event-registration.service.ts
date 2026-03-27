import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventRegistration, EventRegistrationRequest } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventRegistrationService {
  private baseUrl = 'http://localhost:8081/springsecurity/api/event-registrations';

  constructor(private http: HttpClient) { }

  registerToEvent(request: EventRegistrationRequest): Observable<EventRegistration> {
    return this.http.post<EventRegistration>(this.baseUrl, request);
  }

  validateRegistration(id: number): Observable<EventRegistration> {
    return this.http.patch<EventRegistration>(`${this.baseUrl}/${id}/validate`, {});
  }

  getRegistrationsByEvent(eventId: number): Observable<EventRegistration[]> {
    return this.http.get<EventRegistration[]>(`${this.baseUrl}/event/${eventId}`);
  }

  getRegistrationsByParticipant(participantId: number): Observable<EventRegistration[]> {
    return this.http.get<EventRegistration[]>(`${this.baseUrl}/participant/${participantId}`);
  }
}
