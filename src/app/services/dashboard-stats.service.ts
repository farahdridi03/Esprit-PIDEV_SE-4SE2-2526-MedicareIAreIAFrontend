import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MonthlyAppointmentDTO {
  month: string;
  count: number;
}

export interface TopPatientDTO {
  patientName: string;
  totalVisits: number;
  lastVisit: string;
  onlineVisits: number;
  inPersonVisits: number;
  allVisitDates: string[];
}

export interface MonthlyRevenueDTO {
  month: string;
  amount: number;
}

export interface DashboardStatsDTO {
  appointmentsByMonth: MonthlyAppointmentDTO[];
  topPatients: TopPatientDTO[];
  attendanceRate: number;
  noShowRate: number;
  revenueByMonth: MonthlyRevenueDTO[];
  onlineCount: number;
  inPersonCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardStatsService {
  private apiUrl = 'http://localhost:8081/springsecurity/api/v1/dashboard/stats';

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<DashboardStatsDTO> {
    return this.http.get<DashboardStatsDTO>(this.apiUrl);
  }
}
