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

  validateRegistration(id: number): Observable<any> {
    return this.http.put<any>(`http://localhost:8081/springsecurity/api/events/participation/${id}/accept`, {});
  }

  getRegistrationsByEvent(eventId: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8081/springsecurity/api/events/${eventId}/participants`);
  }

  getRegistrationsByParticipant(participantId: number): Observable<EventRegistration[]> {
    return this.http.get<EventRegistration[]>(`${this.baseUrl}/participant/${participantId}`);
  }
}
