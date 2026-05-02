import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  HomeCareService,
  ServiceProvider,
  ProviderProfileDTO,
  ServiceRequest,
  CreateServiceRequestDTO,
  SubmitReviewDTO,
  ServiceReview,
  ProviderAvailability,
  AvailabilityDTO,
  AvailableSlot,
  CalendarEvent,
  CompleteRequestDTO
} from '../models/homecare.model';

@Injectable({
  providedIn: 'root'
})
export class HomecareService {
  private apiUrl = 'http://localhost:8081/springsecurity/api/homecare';

  constructor(private http: HttpClient) { }

  // ── Catalogue (PUBLIC) ──────────────────────────────────────────────────

  getAllServices(): Observable<HomeCareService[]> {
    return this.http.get<HomeCareService[]>(`${this.apiUrl}/services`);
  }

  /**
   * Search for providers by service, sorted by rating.
   * @param serviceId - ID of the service to search
   * @param minRating - Optional minimum rating (e.g.: 4)
   */
  getProvidersByService(serviceId: number, minRating?: number): Observable<ProviderProfileDTO[]> {
    let params = new HttpParams();
    if (minRating != null) {
      params = params.set('minRating', minRating.toString());
    }
    return this.http.get<ProviderProfileDTO[]>(`${this.apiUrl}/services/${serviceId}/providers`, { params });
  }

  getAvailableProviders(serviceId: number, dateTime: string): Observable<ProviderProfileDTO[]> {
    const params = new HttpParams().set('dateTime', dateTime);
    return this.http.get<ProviderProfileDTO[]>(`${this.apiUrl}/services/${serviceId}/available-providers`, { params });
  }

  /**
   * Complete provider profile: bio, specialties, rating, reviews.
   */
  getProviderProfile(providerId: number): Observable<ProviderProfileDTO> {
    return this.http.get<ProviderProfileDTO>(`${this.apiUrl}/providers/${providerId}/profile`);
  }

  /**
   * Provider reviews, from most recent to oldest.
   */
  getProviderReviews(providerId: number): Observable<ServiceReview[]> {
    return this.http.get<ServiceReview[]>(`${this.apiUrl}/providers/${providerId}/reviews`);
  }

  /**
   * Available time slots for a provider over a period.
   * @param from - Start date (YYYY-MM-DD)
   * @param to   - End date   (YYYY-MM-DD)
   */
  getAvailableSlots(providerId: number, from: string, to: string): Observable<AvailableSlot[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<AvailableSlot[]>(`${this.apiUrl}/providers/${providerId}/slots`, { params });
  }

  /**
   * Blocked/unavailable dates for a provider over a period.
   * Returns specific dates where available=false
   * @param providerId - Provider ID
   * @param from - Start date (YYYY-MM-DD)
   * @param to   - End date   (YYYY-MM-DD)
   */
  getBlockedDates(providerId: number, from: string, to: string): Observable<string[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<string[]>(`${this.apiUrl}/providers/${providerId}/blocked-dates`, { params });
  }

  // ── Patient ────────────────────────────────────────────────────────────

  createRequest(dto: CreateServiceRequestDTO): Observable<ServiceRequest> {
    return this.http.post<ServiceRequest>(`${this.apiUrl}/requests`, dto);
  }

  getMyRequests(): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(`${this.apiUrl}/requests/my`);
  }

  getRequestById(id: number): Observable<ServiceRequest> {
    return this.http.get<ServiceRequest>(`${this.apiUrl}/requests/${id}`);
  }

  cancelRequest(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/requests/${id}/cancel`, {});
  }

  completeRequestAsPatient(id: number): Observable<ServiceRequest> {
    return this.http.put<ServiceRequest>(`${this.apiUrl}/requests/${id}/complete`, {});
  }

  submitReview(id: number, dto: SubmitReviewDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/requests/${id}/review`, dto);
  }

  // ── Prestataire ─────────────────────────────────────────────────────────

  getProviderRequests(): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(`${this.apiUrl}/provider/requests`);
  }

  acceptRequest(id: number): Observable<ServiceRequest> {
    return this.http.put<ServiceRequest>(`${this.apiUrl}/provider/requests/${id}/accept`, {});
  }

  declineRequest(id: number): Observable<ServiceRequest> {
    return this.http.put<ServiceRequest>(`${this.apiUrl}/provider/requests/${id}/decline`, {});
  }

  startRequest(id: number): Observable<ServiceRequest> {
    return this.http.put<ServiceRequest>(`${this.apiUrl}/provider/requests/${id}/start`, {});
  }

  completeRequest(id: number, dto: CompleteRequestDTO): Observable<ServiceRequest> {
    return this.http.put<ServiceRequest>(`${this.apiUrl}/provider/requests/${id}/complete`, dto);
  }

  /** Add a weekly availability rule */
  getMyAvailability(): Observable<ProviderAvailability[]> {
    return this.http.get<ProviderAvailability[]>(`${this.apiUrl}/provider/availability`);
  }

  saveAvailability(dto: AvailabilityDTO): Observable<ProviderAvailability> {
    return this.http.post<ProviderAvailability>(`${this.apiUrl}/provider/availability`, dto);
  }

  deleteAvailability(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/provider/availability/${id}`);
  }

  /** Complete calendar view (rules + exceptions) */
  getMyCalendar(): Observable<ProviderAvailability[]> {
    return this.http.get<ProviderAvailability[]>(`${this.apiUrl}/provider/calendar`);
  }

  /**
   * Block an entire day — it will appear unavailable for patients.
   * @param date - Date in format YYYY-MM-DD
   */
  blockDay(date: string): Observable<ProviderAvailability> {
    return this.http.post<ProviderAvailability>(`${this.apiUrl}/provider/calendar/block`, { date });
  }

  /**
   * Unblock a day (removes the blocking entry).
   */
  unblockDay(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/provider/calendar/block/${id}`);
  }

  getCalendarEvents(from: string, to: string): Observable<CalendarEvent[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<CalendarEvent[]>(`${this.apiUrl}/provider/calendar/events`, { params });
  }

  // ── Admin ──────────────────────────────────────────────────────────────

  getAllProviders(): Observable<ServiceProvider[]> {
    return this.http.get<ServiceProvider[]>(`${this.apiUrl}/admin/providers`);
  }

  getPendingProviders(): Observable<ServiceProvider[]> {
    return this.http.get<ServiceProvider[]>(`${this.apiUrl}/admin/providers/pending`);
  }

  verifyProvider(id: number): Observable<ServiceProvider> {
    return this.http.put<ServiceProvider>(`${this.apiUrl}/admin/providers/${id}/verify`, {});
  }

  rejectProvider(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/providers/${id}/reject`);
  }

  getAllRequests(): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(`${this.apiUrl}/admin/requests`);
  }

  createService(service: HomeCareService): Observable<HomeCareService> {
    return this.http.post<HomeCareService>(`${this.apiUrl}/admin/services`, service);
  }

  updateService(id: number, service: HomeCareService): Observable<HomeCareService> {
    return this.http.put<HomeCareService>(`${this.apiUrl}/admin/services/${id}`, service);
  }
}
