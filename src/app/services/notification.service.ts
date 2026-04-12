import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'aid_request' | 'info' | 'warning';
  // Compat fields used by aziz's components
  isRead?: boolean;
  createdAt?: string;
  userId?: number;
  orderId?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly STORAGE_KEY = 'admin_notifications';

  private notificationsSubject = new BehaviorSubject<AppNotification[]>(this.loadFromStorage());
  notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  /** Observable unread count — used by aziz's components */
  unreadCount$ = this.unreadCountSubject.asObservable();

  get unreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read).length;
  }

  constructor() {
    // Keep unreadCount$ in sync
    this.notificationsSubject.subscribe(notifs => {
      this.unreadCountSubject.next(notifs.filter(n => !n.read).length);
    });
  }

  addNotification(titleOrDto: any, message?: string, type: AppNotification['type'] = 'info'): void {
    let notif: AppNotification;
    if (typeof titleOrDto === 'string') {
      notif = {
        id: Date.now().toString(),
        title: titleOrDto,
        message: message || '',
        timestamp: new Date(),
        read: false,
        type
      };
    } else {
      // Called with a NotificationResponseDTO from delivery-tracking
      const dto = titleOrDto;
      notif = {
        id: String(dto.id ?? Date.now()),
        title: dto.title || 'Notification',
        message: dto.message || '',
        timestamp: new Date(dto.createdAt || Date.now()),
        read: dto.isRead ?? false,
        type: 'info',
        isRead: dto.isRead,
        createdAt: dto.createdAt,
        userId: dto.userId,
        orderId: dto.orderId
      };
    }
    const updated = [notif, ...this.notificationsSubject.value].slice(0, 20);
    this.notificationsSubject.next(updated);
    this.saveToStorage(updated);
  }

  markAllRead(): void {
    const updated = this.notificationsSubject.value.map(n => ({ ...n, read: true, isRead: true }));
    this.notificationsSubject.next(updated);
    this.saveToStorage(updated);
  }

  markRead(id: string): void {
    const updated = this.notificationsSubject.value.map(n =>
      n.id === id ? { ...n, read: true, isRead: true } : n
    );
    this.notificationsSubject.next(updated);
    this.saveToStorage(updated);
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
    this.saveToStorage([]);
  }

  // ==== COMPAT API (used by aziz's components) ====

  /** Returns notifications as an Observable (ignores userId — same store) */
  getNotifications(userId?: number): Observable<AppNotification[]> {
    return of(this.notificationsSubject.value);
  }

  /** Marks a single notification as read, returns Observable */
  markAsRead(id: number | string): Observable<AppNotification> {
    this.markRead(String(id));
    const notif = this.notificationsSubject.value.find(n => n.id === String(id));
    return of(notif as AppNotification);
  }

  /** Marks all notifications as read, returns Observable */
  markAllAsRead(userId?: number): Observable<void> {
    this.markAllRead();
    return of(undefined);
  }

  getUnreadCount(userId?: number): Observable<{ unreadCount: number }> {
    return this.unreadCount$.pipe(map(count => ({ unreadCount: count })));
  }

  // ==== PATIENT NOTIFICATIONS ====
  getPatientNotifications(patientId: number): AppNotification[] {
    try {
      const raw = localStorage.getItem(`patient_notifications_${patientId}`);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  addPatientNotification(patientId: number, title: string, message: string, type: AppNotification['type'] = 'info'): void {
    const notifs = this.getPatientNotifications(patientId);
    const notif: AppNotification = {
      id: Date.now().toString(),
      title,
      message,
      timestamp: new Date(),
      read: false,
      type
    };
    const updated = [notif, ...notifs].slice(0, 20);
    localStorage.setItem(`patient_notifications_${patientId}`, JSON.stringify(updated));
  }

  markPatientNotificationsRead(patientId: number): void {
    const notifs = this.getPatientNotifications(patientId);
    const updated = notifs.map(n => ({ ...n, read: true }));
    localStorage.setItem(`patient_notifications_${patientId}`, JSON.stringify(updated));
  }

  clearPatientNotifications(patientId: number): void {
    localStorage.removeItem(`patient_notifications_${patientId}`);
  }

  private loadFromStorage(): AppNotification[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  private saveToStorage(notifs: AppNotification[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifs));
  }
}
