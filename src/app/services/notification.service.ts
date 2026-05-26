import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { NotificationResponseDTO, NotificationType } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly STORAGE_KEY = 'admin_notifications';
  private pharmacyApiUrl = 'http://localhost:8081/springsecurity/api/notifications';

  private notificationsSubject = new BehaviorSubject<NotificationResponseDTO[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    const local = this.loadFromStorage();
    this.notificationsSubject.next(local);
    this.unreadCountSubject.next(local.filter(n => !n.isRead).length);
  }

  // --- API Methods ---

  getNotifications(userId: number): Observable<NotificationResponseDTO[]> {
    return this.http.get<NotificationResponseDTO[]>(`${this.pharmacyApiUrl}/user/${userId}`).pipe(
      tap(notifs => {
        const merged = [...notifs, ...this.loadFromStorage(userId)].slice(0, 50);
        this.notificationsSubject.next(merged);
        this.updateUnreadCount(merged);
      })
    );
  }


  private updateUnreadCount(notifs: NotificationResponseDTO[]) {
    this.unreadCountSubject.next(notifs.filter(n => !n.isRead).length);
  }

  // Handle both DTO and simple string arguments for local storage
  addNotification(notification: NotificationResponseDTO | string, message?: string, type: NotificationType | string = NotificationType.INFO): void {
    if (typeof notification === 'object') {
       const current = this.notificationsSubject.value;
       if (!current.find(n => n.id === notification.id)) {
         const updated = [notification, ...current].slice(0, 50);
         this.notificationsSubject.next(updated);
         this.updateUnreadCount(updated);
       }
    } else {
       const notif: NotificationResponseDTO = {
         id: Date.now().toString(),
         title: notification,
         message: message || '',
         timestamp: new Date(),
         isRead: false,
         type: type
       };
       const updated = [notif, ...this.notificationsSubject.value].slice(0, 50);
       this.notificationsSubject.next(updated);
       this.saveToStorage(updated.filter(n => typeof n.id === 'string')); 
    }
  }

  getUnreadNotifications(userId: number): Observable<NotificationResponseDTO[]> {
    return this.http.get<NotificationResponseDTO[]>(`${this.pharmacyApiUrl}/user/${userId}/unread`);
  }

  getUnreadCount(userId: number): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${this.pharmacyApiUrl}/user/${userId}/count`).pipe(
      tap(res => this.unreadCountSubject.next(res.unreadCount))
    );
  }

  markAsRead(id: number | string, userId?: number): Observable<any> {
    const current = this.notificationsSubject.value;
    const index = current.findIndex(n => n.id === id);
    if (index !== -1) {
        current[index].isRead = true;
        this.notificationsSubject.next([...current]);
        this.updateUnreadCount(current);
    }

    if (typeof id === 'number') {
      return this.http.patch<NotificationResponseDTO>(`${this.pharmacyApiUrl}/${id}/read`, {});
    } else {
      this.saveToStorage(current.filter(n => typeof n.id === 'string'), userId);
      return of(true);
    }
  }


  markAllAsRead(userId?: number): Observable<any> {
    const current = this.notificationsSubject.value;
    current.forEach(n => n.isRead = true);
    this.notificationsSubject.next([...current]);
    this.unreadCountSubject.next(0);
    this.saveToStorage([], userId); 

    if (userId) {
      return this.http.patch<void>(`${this.apiUrl}/user/${userId}/read-all`, {});
    }
    return of(true);
  }


  private get apiUrl() { return this.pharmacyApiUrl; }

  // --- Patient Methods (Local Storage fallback) ---

  getPatientNotifications(patientId: number): NotificationResponseDTO[] {
    try {
      const raw = localStorage.getItem(`patient_notifications_${patientId}`);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  addPatientNotification(patientId: number, title: string, message: string, type: string = 'info'): void {
    const notifs = this.getPatientNotifications(patientId);
    const notif: NotificationResponseDTO = {
      id: Date.now().toString(),
      title,
      message,
      timestamp: new Date(),
      isRead: false,
      type
    };
    const updated = [notif, ...notifs].slice(0, 20);
    localStorage.setItem(`patient_notifications_${patientId}`, JSON.stringify(updated));
    
    // Also push to the current subject if the patient is the one logged in
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notif, ...current].slice(0, 50));
    this.updateUnreadCount([notif, ...current]);
  }


  markPatientNotificationsRead(patientId: number): void {
    const notifs = this.getPatientNotifications(patientId);
    const updated = notifs.map(n => ({ ...n, isRead: true }));
    localStorage.setItem(`patient_notifications_${patientId}`, JSON.stringify(updated));
  }

  clearPatientNotifications(patientId: number): void {
    localStorage.removeItem(`patient_notifications_${patientId}`);
  }

  // --- Storage Helpers ---

  private loadFromStorage(userId?: number): NotificationResponseDTO[] {
    try {
      const key = userId ? `patient_notifications_${userId}` : this.STORAGE_KEY;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  private saveToStorage(notifs: NotificationResponseDTO[], userId?: number): void {
    const key = userId ? `patient_notifications_${userId}` : this.STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(notifs));
  }


  clearAll(): void {
    this.notificationsSubject.next([]);
    this.saveToStorage([]);
    this.unreadCountSubject.next(0);
  }
}
