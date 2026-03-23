import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WeeklySchedule, ScheduleException } from '../models/schedule.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private apiUrl = 'http://localhost:8081/springsecurity/api/v1/providers';

  constructor(private http: HttpClient) {}

  // Fetch the template
  getWeeklySchedule(providerId: number): Observable<WeeklySchedule> {
    return this.http.get<WeeklySchedule>(`${this.apiUrl}/${providerId}/weekly-schedule`);
  }

  // Save the template
  saveWeeklySchedule(providerId: number, schedule: WeeklySchedule): Observable<WeeklySchedule> {
    return this.http.put<WeeklySchedule>(`${this.apiUrl}/${providerId}/weekly-schedule`, schedule);
  }

  saveSpecificWeek(providerId: number, weekDays: ScheduleException[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${providerId}/specific-week`, weekDays);
  }

  // Exceptions
  getExceptions(providerId: number): Observable<ScheduleException[]> {
    return this.http.get<ScheduleException[]>(`${this.apiUrl}/${providerId}/schedule-exceptions`)
      .pipe(
        catchError(() => of([]))
      );
  }

  addException(providerId: number, exception: ScheduleException): Observable<ScheduleException> {
    return this.http.post<ScheduleException>(`${this.apiUrl}/${providerId}/schedule-exceptions`, exception)
      .pipe(
        catchError(() => {
          return of({ ...exception, id: Math.floor(Math.random() * 1000) });
        })
      );
  }

  deleteException(providerId: number, exceptionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${providerId}/schedule-exceptions/${exceptionId}`)
      .pipe(catchError(() => of(undefined)));
  }

  private getDefaultSchedule(providerId: number): WeeklySchedule {
    const days: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[] = 
      ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    
    return {
      providerId,
      days: days.map(day => ({
        dayOfWeek: day,
        active: false, // Default to inactive until user configures it
        timeSlots: []  // Empty time slots
      }))
    };
  }
}
