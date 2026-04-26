import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnalyticsSummary {
  totalUsers: number;
  totalEvents: number;
  totalDonations: number;
  totalPosts: number;
  usersByRole: { [key: string]: number };
  userGrowth: { month: string, count: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private baseUrl = 'http://localhost:8081/springsecurity/api/analytics';

  constructor(private http: HttpClient) { }

  getSummary(): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${this.baseUrl}/summary`);
  }
}
