import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';

export interface WsNotification {
  id:           string;
  title:        string;
  message:      string;
  type:         'aid_request' | 'info' | 'warning';
  targetUserId: number | null;
  timestamp:    string;
  read:         boolean;
}

const ADMIN_STORAGE_KEY = 'ws_admin_notifications';

@Injectable({ providedIn: 'root' })
export class WebSocketNotificationService implements OnDestroy {

  private readonly WS_URL = 'ws://localhost:8081/springsecurity/ws';

  private client!: Client;
  private connected = false;

  // Notifications admin — initialisées depuis localStorage
  private adminNotifs = new BehaviorSubject<WsNotification[]>(this.loadAdminFromStorage());
  adminNotifications$ = this.adminNotifs.asObservable();

  // Notifications patient
  private patientNotifs = new BehaviorSubject<WsNotification[]>([]);
  patientNotifications$ = this.patientNotifs.asObservable();

  // Notifications clinic
  private clinicNotifs = new BehaviorSubject<WsNotification[]>([]);
  clinicNotifications$ = this.clinicNotifs.asObservable();

  // Subs actifs
  private adminSub: any     = null;
  private patientSub: any   = null;
  private clinicSub: any    = null;
  private currentPatientId: number | null = null;

  constructor(private zone: NgZone) {}

  // ─── Connexion ───────────────────────────────────────────────────────────

  connect(): void {
    if (this.connected) return;

    this.client = new Client({
      brokerURL: this.WS_URL,
      reconnectDelay: 5000,
      debug: (msg) => console.log('[STOMP DEBUG]', msg),
      onConnect: (frame) => {
        this.zone.run(() => {
          this.connected = true;
          console.log('[WS] ✅ Connecté au broker STOMP', frame);
          // Re-souscrire après reconnexion
          if (this.adminSub !== null) { this.adminSub = null; this.subscribeAsAdmin(); }
          if (this.patientSub !== null && this.currentPatientId !== null) {
            this.patientSub = null; this.subscribeAsPatient(this.currentPatientId);
          }
          if (this.clinicSub !== null) { this.clinicSub = null; this.subscribeAsClinic(); }
        });
      },
      onDisconnect: () => {
        this.zone.run(() => {
          this.connected = false;
          console.log('[WS] Déconnecté');
        });
      },
      onStompError: (frame) => {
        console.error('[WS] ❌ Erreur STOMP :', frame.headers['message'], frame);
      },
      onWebSocketError: (event) => {
        console.error('[WS] ❌ Erreur WebSocket :', event);
      },
      onWebSocketClose: (event) => {
        console.warn('[WS] WebSocket fermé :', event.code, event.reason);
      }
    });

    this.client.activate();
  }

  disconnect(): void {
    this.client?.deactivate();
    this.connected = false;
    this.adminSub = null;
    this.patientSub = null;
  }

  // ─── Subscriptions ───────────────────────────────────────────────────────

  /** S'abonner aux notifications admin */
  subscribeAsAdmin(): void {
    this.waitForConnection(() => {
      if (this.adminSub) return;
      this.adminSub = this.client.subscribe(
        '/topic/admin/notifications',
        (msg: IMessage) => {
          this.zone.run(() => {
            const notif: WsNotification = { ...JSON.parse(msg.body), read: false };
            // Éviter les doublons (même id déjà présent)
            const current = this.adminNotifs.value.filter(n => n.id !== notif.id);
            const updated = [notif, ...current].slice(0, 50);
            this.adminNotifs.next(updated);
            this.saveAdminToStorage(updated);
          });
        }
      );
      console.log('[WS] Abonné : /topic/admin/notifications');
    });
  }

  /** S'abonner aux notifications d'un patient spécifique */
  subscribeAsPatient(patientId: number): void {
    this.currentPatientId = patientId;
    this.waitForConnection(() => {
      if (this.patientSub) return;
      this.patientSub = this.client.subscribe(
        `/topic/patient/${patientId}/notifications`,
        (msg: IMessage) => {
          console.log('[WS] ✅ Message reçu patient :', msg.body);
          this.zone.run(() => {
            const notif: WsNotification = { ...JSON.parse(msg.body), read: false };
            const current = this.patientNotifs.value;
            this.patientNotifs.next([notif, ...current].slice(0, 50));
            console.log('[WS] patientNotifs updated:', this.patientNotifs.value.length);
          });
        }
      );
      console.log(`[WS] Abonné : /topic/patient/${patientId}/notifications`);
    });
  }

  /** S'abonner aux notifications clinic (broadcast toutes cliniques) */
  subscribeAsClinic(): void {
    this.waitForConnection(() => {
      if (this.clinicSub) return;
      this.clinicSub = this.client.subscribe(
        '/topic/clinic/notifications',
        (msg: IMessage) => {
          this.zone.run(() => {
            const notif: WsNotification = { ...JSON.parse(msg.body), read: false };
            const current = this.clinicNotifs.value;
            this.clinicNotifs.next([notif, ...current].slice(0, 50));
          });
        }
      );
      console.log('[WS] Abonné : /topic/clinic/notifications');
    });
  }

  /** Publier un message vers le serveur (ex: /app/admin/notify) */
  publish(destination: string, body: object): void {
    this.waitForConnection(() => {
      this.client.publish({ destination, body: JSON.stringify(body) });
    });
  }

  /** Ajouter manuellement une notification admin (ex: depuis REST fallback) */
  addAdminNotification(notif: WsNotification): void {
    const current = this.adminNotifs.value;
    if (current.some(n => n.id === notif.id)) return; // éviter doublon
    const updated = [notif, ...current].slice(0, 50);
    this.adminNotifs.next(updated);
    this.saveAdminToStorage(updated);
  }

  unsubscribeAdmin(): void {
    this.adminSub?.unsubscribe();
    this.adminSub = null;
  }

  unsubscribePatient(): void {
    this.patientSub?.unsubscribe();
    this.patientSub = null;
  }

  unsubscribeClinic(): void {
    this.clinicSub?.unsubscribe();
    this.clinicSub = null;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  markAdminRead(): void {
    const updated = this.adminNotifs.value.map(n => ({ ...n, read: true }));
    this.adminNotifs.next(updated);
    this.saveAdminToStorage(updated);
  }

  markPatientRead(): void {
    const updated = this.patientNotifs.value.map(n => ({ ...n, read: true }));
    this.patientNotifs.next(updated);
  }

  clearAdmin(): void {
    this.adminNotifs.next([]);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  }
  clearPatient(): void { this.patientNotifs.next([]); }

  get adminUnreadCount(): number {
    return this.adminNotifs.value.filter(n => !n.read).length;
  }

  get patientUnreadCount(): number {
    return this.patientNotifs.value.filter(n => !n.read).length;
  }

  // ─── Persistence localStorage ─────────────────────────────────────────────

  private loadAdminFromStorage(): WsNotification[] {
    try {
      const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  private saveAdminToStorage(notifs: WsNotification[]): void {
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(notifs));
    } catch {}
  }

  /** Attend que la connexion STOMP soit active avant d'exécuter callback */
  private waitForConnection(callback: () => void, attempt = 0): void {
    if (this.client?.connected) {
      callback();
    } else if (attempt < 20) {
      setTimeout(() => this.waitForConnection(callback, attempt + 1), 300);
    } else {
      console.warn('[WS] Impossible de se connecter après 20 tentatives');
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
