import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { startWith, switchMap, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ChatChannel {
  id: number;
  name: string;
  description?: string;
  unreadCount?: number;
}

export interface ChatMessage {
  id: number;
  channelId: number;
  content: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  isOwn?: boolean;
}

export interface ChatMessageRequest {
  channelId: number;
  content: string;
  authorId: number;
}

@Injectable({ providedIn: 'root' })
export class MessagingService {

  private base = `${environment.apiUrl}/api/forum/messaging`;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('auth_token') ||
                  JSON.parse(localStorage.getItem('currentUser') || '{}')?.token || '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getChannels(): Observable<ChatChannel[]> {
    return this.http.get<ChatChannel[]>(`${this.base}/channels`, { headers: this.headers() });
  }

  getMessages(channelId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.base}/channels/${channelId}/messages`,
      { headers: this.headers() }
    );
  }

  pollMessages(channelId: number): Observable<ChatMessage[]> {
    return interval(5000).pipe(
      startWith(0),
      switchMap(() => this.getMessages(channelId)),
      shareReplay(1)
    );
  }

  sendMessage(req: ChatMessageRequest): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(
      `${this.base}/channels/${req.channelId}/messages`,
      req,
      { headers: this.headers() }
    );
  }

  getUnreadCount(channelId: number): Observable<number> {
    return this.http.get<number>(
      `${this.base}/channels/${channelId}/unread`,
      { headers: this.headers() }
    );
  }
}
