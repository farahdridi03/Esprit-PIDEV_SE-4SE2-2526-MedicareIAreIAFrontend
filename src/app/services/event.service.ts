import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicalEvent, EventType, EventSeat, SaveSeatRequest, SeatZoneSummary, SeatingStats } from '../models/event.model';

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

  isParticipating(id: number): Observable<{participating: boolean, status?: string, participationId?: number}> {
    return this.http.get<{participating: boolean, status?: string, participationId?: number}>(`${this.baseUrl}/${id}/is-participating`);
  }

  acceptParticipation(participationId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/participation/${participationId}/accept`, {});
  }

  rejectParticipation(participationId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/participation/${participationId}/reject`, {});
  }

  getEventStats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/stats`);
  }

  searchEvents(keyword: string, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/search`, {
      params: { keyword, page: page.toString(), size: size.toString() }
    });
  }

  getEventSeats(eventId: number): Observable<EventSeat[]> {
    return this.http.get<EventSeat[]>(`${this.baseUrl}/seats/${eventId}`);
  }

  getEventSeatSummary(eventId: number): Observable<SeatZoneSummary[]> {
    return this.http.get<SeatZoneSummary[]>(`${this.baseUrl}/seats/${eventId}/summary`);
  }

  getSeatingStats(eventId: number): Observable<SeatingStats> {
    return this.http.get<SeatingStats>(`${this.baseUrl}/seats/${eventId}/stats`);
  }

  searchSeats(eventId: number, keyword: string): Observable<EventSeat[]> {
    return this.http.get<EventSeat[]>(`${this.baseUrl}/seats/${eventId}/search`, {
      params: { q: keyword }
    });
  }

  generateLayout(eventId: number, venueType: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/seats/${eventId}/generate`, {}, {
      params: { venueType }
    });
  }

  saveSeatsBatch(eventId: number, requests: SaveSeatRequest[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/seats/${eventId}/batch`, requests);
  }

  reserveSeat(seatId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/seats/${seatId}/reserve`, {});
  }

  releaseSeat(seatId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/seats/${seatId}/release`, {});
  }

  getEventAnalytics(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/analytics`);
  }

  markAttendance(id: number, userId: number, attended: boolean): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/attendance/${userId}`, {}, {
      params: { attended: attended.toString() }
    });
  }

  submitFeedback(id: number, feedback: {rating: number, comment: string}): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/feedback`, feedback);
  }

  downloadTicket(participationId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/participation/${participationId}/ticket`, {
      responseType: 'blob'
    });
  }
}
