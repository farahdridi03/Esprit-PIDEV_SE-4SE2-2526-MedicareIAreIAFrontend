import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CalendarAvailability } from '../models/schedule.model';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private baseUrl = 'http://localhost:8081/springsecurity/api/v1';

  constructor(private http: HttpClient) {}

  /**
   * Fetch all availabilities for a doc for the last month to future.
   */
  getAvailabilitiesByDoctor(providerId: number): Observable<CalendarAvailability[]> {
    console.log(`[DEBUG] AvailabilityService: Fetching availabilities for provider ${providerId}`);
    return this.http.get<CalendarAvailability[]>(`${this.baseUrl}/providers/${providerId}/availabilities`).pipe(
      tap(data => console.log(`[DEBUG] AvailabilityService: Found ${data?.length ?? 0} availabilities in DB`, data))
    );
  }

  /**
   * Individual slot save call.
   */
  createAvailability(providerId: number, availability: CalendarAvailability): Observable<CalendarAvailability> {
    console.log(`[DEBUG] AvailabilityService: Posting to ${this.baseUrl}/providers/${providerId}/availabilities`, availability);
    return this.http.post<CalendarAvailability>(`${this.baseUrl}/providers/${providerId}/availabilities`, availability).pipe(
      tap(res => console.log(`[DEBUG] AvailabilityService: Save Success`, res))
    );
  }

  /**
   * Delete specific slot.
   */
  deleteAvailability(availabilityId: number): Observable<void> {
    console.log(`[DEBUG] AvailabilityService: Deleting slot ${availabilityId}`);
    return this.http.delete<void>(`${this.baseUrl}/availabilities/${availabilityId}`).pipe(
      tap(() => console.log(`[DEBUG] AvailabilityService: Delete Success`))
    );
  }
}
