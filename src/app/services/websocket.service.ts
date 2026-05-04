import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient: Client | null = null;
  private notificationSubject = new BehaviorSubject<any>(null);

  constructor() { }

  connect(userId: number): void {
    if (this.stompClient && this.stompClient.active) {
      console.log('WebSocket already active');
      return;
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8081/springsecurity/ws'),
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('STOMP Connected: ', frame);
      
      // Subscribe to personal notifications (for both doctors and parents)
      this.stompClient?.subscribe(`/topic/notifications/${userId}`, (message: Message) => {
        if (message.body) {
          try {
            const notification = JSON.parse(message.body);
            console.log('Received notification:', notification);
            this.notificationSubject.next(notification);
          } catch (e) {
            console.error('Error parsing notification body', e);
            this.notificationSubject.next(message.body);
          }
        }
      });

      // Legacy subscription for doctor-specific logic if needed
      this.stompClient?.subscribe(`/topic/doctor/${userId}`, (message: Message) => {
        if (message.body) {
          try {
            const notification = JSON.parse(message.body);
            this.notificationSubject.next(notification);
          } catch (e) {
            this.notificationSubject.next(message.body);
          }
        }
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP Broker reported error: ' + frame.headers['message']);
      console.error('STOMP Additional details: ' + frame.body);
    };

    this.stompClient.onWebSocketClose = () => {
      console.log('WebSocket connection closed');
    };

    this.stompClient.activate();
  }

  getNotifications(): Observable<any> {
    return this.notificationSubject.asObservable();
  }

  disconnect(): void {
    if (this.stompClient !== null) {
      this.stompClient.deactivate();
    }
    console.log("STOMP Disconnected");
  }
}
