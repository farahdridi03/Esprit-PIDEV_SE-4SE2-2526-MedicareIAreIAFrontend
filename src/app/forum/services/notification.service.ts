import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client, IMessage } from '@stomp/stompjs';

export interface ForumNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: number;
  meetLink?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private apiUrl = `${environment.apiUrl}/api/notifications`;
  private wsUrl: string;

  private stompClient?: Client;
  private newNotification$ = new Subject<ForumNotification>();
  private unreadCount$ = new BehaviorSubject<number>(0);
  private likeUpdate$ = new Subject<{ postId: number; likesCount: number }>();

  constructor(private http: HttpClient, private ngZone: NgZone) {
    const wsBase = environment.apiUrl
      .replace('http://', 'ws://')
      .replace('https://', 'wss://');
    this.wsUrl = `${wsBase}/ws`;
  }

  connect(token: string): void {
    this.disconnect();

    this.stompClient = new Client({
      brokerURL: `${this.wsUrl}?token=${encodeURIComponent(token)}`,
      reconnectDelay: 5000,

      onConnect: () => {
        console.log('[WS] Connecté — notifications en temps réel');

        // Notifications personnelles (likes, commentaires)
        this.stompClient?.subscribe('/user/queue/notifications', (msg: IMessage) => {
          this.ngZone.run(() => {
            try {
              const notif: ForumNotification = JSON.parse(msg.body);
              this.newNotification$.next(notif);
              this.unreadCount$.next(this.unreadCount$.value + 1);
            } catch (e) {
              console.error('[WS] parse error', e);
            }
          });
        });

        // Broadcast global (Code Blue, etc.)
        this.stompClient?.subscribe('/topic/notifications', (msg: IMessage) => {
          this.ngZone.run(() => {
            try {
              const notif: ForumNotification = JSON.parse(msg.body);
              this.newNotification$.next(notif);
            } catch (e) {
              console.error('[WS] parse error', e);
            }
          });
        });

        // Likes temps réel
        this.stompClient?.subscribe('/topic/post-likes', (msg: IMessage) => {
          this.ngZone.run(() => {
            try {
              const update = JSON.parse(msg.body);
              this.likeUpdate$.next(update);
            } catch (e) {}
          });
        });
      },

      onStompError: (frame) => {
        console.error('[WS] STOMP error', frame.headers['message']);
      },

      onDisconnect: () => {
        console.log('[WS] Déconnecté');
      },

      onWebSocketError: (event) => {
        console.error('[WS] WebSocket error', event);
      }
    });

    this.stompClient.activate();
  }

  disconnect(): void {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
    }
    this.stompClient = undefined;
  }

  onNewNotification(): Observable<ForumNotification> {
    return this.newNotification$.asObservable();
  }

  onLikeUpdate(): Observable<{ postId: number; likesCount: number }> {
    return this.likeUpdate$.asObservable();
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  getNotifications(): Observable<ForumNotification[]> {
    return this.http.get<ForumNotification[]>(this.apiUrl);
  }

  fetchUnreadCount(): void {
    this.http.get<number>(`${this.apiUrl}/unread-count`).subscribe(count => {
      this.unreadCount$.next(count);
    });
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/mark-all-read`, {});
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
