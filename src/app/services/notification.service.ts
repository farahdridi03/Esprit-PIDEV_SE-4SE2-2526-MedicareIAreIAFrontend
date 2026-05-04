// src/app/services/notification.service.ts

import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, interval } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { NotificationDTO } from '../models/notification.model';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private readonly baseUrl = 'http://localhost:8081/springsecurity/api/v1/doctors';

  private unreadCount$ = new BehaviorSubject<number>(0);
  public unreadCount = this.unreadCount$.asObservable();

  private notifications$ = new BehaviorSubject<NotificationDTO[]>([]);
  public notifications = this.notifications$.asObservable();

  private pollingSub: Subscription | null = null;
  private wsSub: Subscription | null = null;

  constructor(private http: HttpClient, private wsService: WebsocketService) {}

  getNotifications(doctorId: number): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.baseUrl}/${doctorId}/notifications`).pipe(
      tap((notifs: NotificationDTO[]) => this.notifications$.next(notifs))
    );
  }

  getUnread(doctorId: number): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.baseUrl}/${doctorId}/notifications/unread`);
  }

  markAsRead(doctorId: number, notifId: number): Observable<NotificationDTO> {
    return this.http.patch<NotificationDTO>(`${this.baseUrl}/${doctorId}/notifications/${notifId}/read`, {});
  }

  markAllAsRead(doctorId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${doctorId}/notifications/read-all`, {});
  }

  deleteNotification(doctorId: number, notifId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${doctorId}/notifications/${notifId}`);
  }

  deleteAllNotifications(doctorId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${doctorId}/notifications/delete-all`);
  }

  refreshUnreadCount(doctorId: number): void {
    this.http.get<{ count: number }>(`${this.baseUrl}/${doctorId}/notifications/unread-count`).subscribe({
      next: (res) => this.unreadCount$.next(res.count),
      error: () => {}
    });
  }

  startPolling(doctorId: number, intervalMs: number = 30000): void {
    this.stopPolling();
    this.refreshUnreadCount(doctorId);
    this.pollingSub = interval(intervalMs).pipe(
      switchMap(() => this.http.get<{ count: number }>(`${this.baseUrl}/${doctorId}/notifications/unread-count`))
    ).subscribe({
      next: (res) => this.unreadCount$.next(res.count),
      error: () => {}
    });
  }

  stopPolling(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = null;
    }
  }

  connectWebSocket(doctorId: number): void {
    this.wsService.connect(doctorId);
    if (this.wsSub) this.wsSub.unsubscribe();
    
    this.wsSub = this.wsService.getNotifications().subscribe(newNotif => {
      if (newNotif && typeof newNotif === 'object') {
        const current = this.notifications$.value;
        this.notifications$.next([newNotif, ...current]);
        this.unreadCount$.next(this.unreadCount$.value + 1);
      }
    });
  }

  disconnectWebSocket(): void {
    if (this.wsSub) {
      this.wsSub.unsubscribe();
      this.wsSub = null;
    }
    this.wsService.disconnect();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
