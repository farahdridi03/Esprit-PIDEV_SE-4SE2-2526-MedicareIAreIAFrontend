import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface StaffPerformance {
  technicianName: string;
  totalAnalyses:  number;
  urgentCases:    number;
  attentionCases: number;
  surveillanceCases: number;
  urgentRate:     number;
}

export interface PerformanceReport {
  from:           string;
  to:             string;
  totalAnalyses:  number;
  urgentCount:    number;
  technicianCount:number;
  staff:          StaffPerformance[];
}

@Component({
  selector: 'app-lab-staff-performance',
  templateUrl: './lab-staff-performance.component.html',
  styleUrls: ['./lab-staff-performance.component.scss']
})
export class LabStaffPerformanceComponent implements OnInit {

  private readonly API = 'http://localhost:8081/springsecurity/api/lab-staff/performance';

  report: PerformanceReport | null = null;
  loading = false;
  error   = '';

  fromDate = '';
  toDate   = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    this.fromDate = yesterday.toISOString().split('T')[0];
    this.toDate   = today.toISOString().split('T')[0];

    this.loadReport();
  }

  loadReport(): void {
    this.loading = true;
    this.error   = '';

    let params = new HttpParams()
      .set('from', this.fromDate)
      .set('to',   this.toDate);

    this.http.get<PerformanceReport>(this.API, { params }).subscribe({
      next: data => {
        this.report  = data;
        this.loading = false;
      },
      error: err => {
        this.error   = 'Failed to load performance data: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  loadToday(): void {
    this.loading = true;
    this.error   = '';
    this.http.get<PerformanceReport>(this.API + '/today').subscribe({
      next: data => {
        this.report  = data;
        this.loading = false;
      },
      error: err => {
        this.error   = 'Failed to load today\'s data: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  urgentRateClass(rate: number): string {
    if (rate > 30) return 'rate-high';
    if (rate > 15) return 'rate-medium';
    return 'rate-low';
  }

  riskIcon(risk: string): string {
    switch (risk) {
      case 'URGENT':       return '🔴';
      case 'ATTENTION':    return '🟠';
      case 'SURVEILLANCE': return '🟡';
      default:             return '🟢';
    }
  }
}
