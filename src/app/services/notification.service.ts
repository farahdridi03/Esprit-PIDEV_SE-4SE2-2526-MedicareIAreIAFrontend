import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'aid_request' | 'info' | 'warning';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly STORAGE_KEY = 'admin_notifications';

  private notificationsSubject = new BehaviorSubject<AppNotification[]>(this.loadFromStorage());
  notifications$ = this.notificationsSubject.asObservable();

  get unreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read).length;
  }

  addNotification(title: string, message: string, type: AppNotification['type'] = 'info'): void {
    const notif: AppNotification = {
      id: Date.now().toString(),
      title,
      message,
      timestamp: new Date(),
      read: false,
      type
    };
    const updated = [notif, ...this.notificationsSubject.value].slice(0, 20); // keep last 20
    this.notificationsSubject.next(updated);
    this.saveToStorage(updated);
  }

  markAllRead(): void {
    const updated = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updated);
    this.saveToStorage(updated);
  }

  markRead(id: string): void {
    const updated = this.notificationsSubject.value.map(n => n.id === id ? { ...n, read: true } : n);
    this.notificationsSubject.next(updated);
    this.saveToStorage(updated);
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
    this.saveToStorage([]);
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
}
