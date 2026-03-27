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

  getUpcomingEvents(): Observable<MedicalEvent[]> {
    return this.http.get<MedicalEvent[]>(`${this.baseUrl}/upcoming`);
  }

  getEventsByType(type: EventType): Observable<MedicalEvent[]> {
    return this.http.get<MedicalEvent[]>(`${this.baseUrl}/type/${type}`);
  }

  createEvent(event: MedicalEvent): Observable<MedicalEvent> {
    return this.http.post<MedicalEvent>(this.baseUrl, event);
  }

  updateEvent(id: number, event: MedicalEvent): Observable<MedicalEvent> {
    return this.http.put<MedicalEvent>(`${this.baseUrl}/${id}`, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
