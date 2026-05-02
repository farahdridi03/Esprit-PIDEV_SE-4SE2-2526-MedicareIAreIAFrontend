import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { DeliveryResponseDTO } from '../models/pharmacy.model';

import { NotificationService } from './notification.service';
import { NotificationResponseDTO } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveryTrackingService {
  private readonly apiUrl = 'http://localhost:8081/springsecurity/api/pharmacy/deliveries';
  private stompClient: Client | null = null;
  private deliveryUpdateSubject = new Subject<DeliveryResponseDTO>();
  private isConnectedSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

  public deliveryUpdates$ = this.deliveryUpdateSubject.asObservable();
  public isConnected$ = this.isConnectedSubject.asObservable();

  connectToOrderTracking(orderId: number): void {
    if (this.stompClient && this.stompClient.active) {
      this.disconnect();
    }

    const socket = new SockJS('http://localhost:8081/springsecurity/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket as any,
      debug: (str: string) => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame: any) => {
      this.isConnectedSubject.next(true);
      this.stompClient?.subscribe(`/topic/delivery/${orderId}`, (message: IMessage) => {
        if (message.body) {
          const update = JSON.parse(message.body) as DeliveryResponseDTO;
          this.deliveryUpdateSubject.next(update);
        }
      });
    };

    this.stompClient.onStompError = (frame: any) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.stompClient.onWebSocketClose = () => {
      this.isConnectedSubject.next(false);
    };

    this.stompClient.activate();
  }

  connectToUserNotifications(userEmail: string): void {
    if (this.stompClient && this.stompClient.active) {
      this.disconnect();
    }

    const socket = new SockJS('http://localhost:8081/springsecurity/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame: any) => {
      this.isConnectedSubject.next(true);
      
      // On s'abonne à la queue privée de l'utilisateur
      this.stompClient?.subscribe(`/user/queue/notifications`, (message: IMessage) => {
        if (message.body) {
          const notification = JSON.parse(message.body) as NotificationResponseDTO;
          console.log('Received real-time notification!', notification);
          this.notificationService.addNotification(notification);
        }
      });
    };

    this.stompClient.onStompError = (frame: any) => {
      console.error('Broker reported error (Notifications): ' + frame.headers['message']);
    };

    this.stompClient.onWebSocketClose = () => {
      this.isConnectedSubject.next(false);
    };

    this.stompClient.activate();
  }

  disconnect(): void {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
    }
    this.isConnectedSubject.next(false);
  }

  getDeliveryDetails(orderId: number): Observable<DeliveryResponseDTO> {
    return this.http.get<DeliveryResponseDTO>(`${this.apiUrl}/order/${orderId}`);
  }
}
