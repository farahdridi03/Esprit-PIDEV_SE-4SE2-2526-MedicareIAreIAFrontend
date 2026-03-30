import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap, shareReplay, startWith } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ForumNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/api/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<ForumNotification[]> {
    return this.http.get<ForumNotification[]>(this.apiUrl);
  }

  getUnreadCount(): Observable<number> {
    // Poll every 30 seconds for new notifications
    return interval(30000).pipe(
      startWith(0),
      switchMap(() => this.http.get<number>(`${this.apiUrl}/unread-count`)),
      shareReplay(1)
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/mark-all-read`, {});
  }
}
