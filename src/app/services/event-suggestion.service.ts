import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EventSuggestionRequest {
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventSuggestionService {
  private baseUrl = 'http://localhost:8081/springsecurity/api/event-suggestions';

  constructor(private http: HttpClient) { }

  suggestEvent(request: EventSuggestionRequest): Observable<any> {
    return this.http.post<any>(this.baseUrl, request);
  }

  getAllSuggestions(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }
}
