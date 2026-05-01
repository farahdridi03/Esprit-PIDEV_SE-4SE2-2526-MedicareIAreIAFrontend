import { Injectable, NgZone } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Client, Message } from '@stomp/stompjs';
import { Notification } from '../models/notification.model';
import * as SockJS_ from 'sockjs-client';
const SockJS = (SockJS_ as any).default || SockJS_;
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private client: Client | null = null;
  private notificationSubject = new Subject<Notification>();
  constructor(private ngZone: NgZone) { }
  connect(email: string) {
    if (this.client && this.client.connected) {
      return;
    }
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8081/springsecurity/ws'),
      connectHeaders: {
        Authorization: 'Bearer ' + localStorage.getItem('auth_token')
      },
      debug: (msg) => {
        console.log('STOMP Debug: ' + msg);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
    this.client.onConnect = (frame) => {
      console.log('Connected to WebSocket as ' + email);
      this.client?.subscribe(`/user/${email}/queue/notifications`, (message: Message) => {
        if (message.body) {
          this.onMessageReceived(message.body);
        }
      });
    };
    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };
    this.client.activate();
  }
  disconnect() {
    if (this.client) {
      this.client.deactivate();
      console.log("Disconnected from WebSocket");
    }
  }
  private onMessageReceived(body: string) {
    console.log("WebSocket Notification Received: ", body);
    const notification: Notification = JSON.parse(body);
    this.ngZone.run(() => {
      this.notificationSubject.next(notification);
    });
  }
  getNotifications(): Observable<Notification> {
    return this.notificationSubject.asObservable();
  }
}
