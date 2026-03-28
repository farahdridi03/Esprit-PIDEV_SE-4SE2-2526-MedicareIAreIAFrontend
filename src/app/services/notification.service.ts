import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { NotificationResponseDTO } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8081/springsecurity/api/pharmacy/notifications';

  private notificationsSubject = new BehaviorSubject<NotificationResponseDTO[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) { }

  getNotifications(userId: number): Observable<NotificationResponseDTO[]> {
    return this.http.get<NotificationResponseDTO[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(notifs => {
        this.notificationsSubject.next(notifs);
        this.unreadCountSubject.next(notifs.filter(n => !n.isRead).length);
      })
    );
  }

  // Permet d'injecter une notification reçue par WebSocket
  addNotification(notification: NotificationResponseDTO) {
    const current = this.notificationsSubject.value;
    // On l'ajoute au début si elle n'existe pas déjà
    if (!current.find(n => n.id === notification.id)) {
      const updated = [notification, ...current];
      this.notificationsSubject.next(updated);
      this.unreadCountSubject.next(updated.filter(n => !n.isRead).length);
    }
  }

  getUnreadNotifications(userId: number): Observable<NotificationResponseDTO[]> {
    return this.http.get<NotificationResponseDTO[]>(`${this.apiUrl}/user/${userId}/unread`);
  }

  getUnreadCount(userId: number): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${this.apiUrl}/user/${userId}/count`).pipe(
      tap(res => this.unreadCountSubject.next(res.unreadCount))
    );
  }

  markAsRead(id: number): Observable<NotificationResponseDTO> {
    return this.http.patch<NotificationResponseDTO>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(updated => {
        const current = this.notificationsSubject.value;
        const index = current.findIndex(n => n.id === id);
        if (index !== -1) {
          current[index].isRead = true;
          this.notificationsSubject.next([...current]);
          this.unreadCountSubject.next(current.filter(n => !n.isRead).length);
        }
      })
    );
  }

  markAllAsRead(userId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/user/${userId}/read-all`, {}).pipe(
      tap(() => {
        const current = this.notificationsSubject.value;
        current.forEach(n => n.isRead = true);
        this.notificationsSubject.next([...current]);
        this.unreadCountSubject.next(0);
      })
    );
  }
}
