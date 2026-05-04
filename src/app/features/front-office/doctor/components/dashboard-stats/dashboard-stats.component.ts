import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { DashboardStatsService, DashboardStatsDTO } from '../../../../../services/dashboard-stats.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-stats',
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.scss']
})
export class DashboardStatsComponent implements OnInit, AfterViewInit {
  stats?: DashboardStatsDTO;
  isLoading = true;
  selectedPatientName: string | null = null;

  @ViewChild('appointmentChart') appointmentChartCanvas!: ElementRef;
  @ViewChild('typeChart') typeChartCanvas!: ElementRef;
  @ViewChild('revenueChart') revenueChartCanvas!: ElementRef;

  constructor(
    private statsService: DashboardStatsService,
    private cdr: ChangeDetectorRef
  ) { }

  togglePatient(name: string): void {
    this.selectedPatientName = this.selectedPatientName === name ? null : name;
  }

  ngOnInit(): void {
    this.loadStats();
  }

  getPercentage(value: number): number {
    const total = (this.stats?.onlineCount || 0) + (this.stats?.inPersonCount || 0);
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  getMaxVisits(): number {
    if (!this.stats?.topPatients || this.stats.topPatients.length === 0) return 1;
    return Math.max(...this.stats.topPatients.map(p => p.totalVisits));
  }

  getAvatarColor(name: string): string {
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  ngAfterViewInit(): void {
  }

  private charts: Chart[] = [];

  loadStats(): void {
    this.statsService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
        this.cdr.detectChanges(); // Force DOM update for ViewChild
        setTimeout(() => this.initCharts(), 0);
      },
      error: (err) => {
        console.error('Error loading stats', err);
        this.isLoading = false;
      }
    });
  }

  initCharts(): void {
    // Destroy previous charts to avoid "canvas already in use" errors
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];

    if (!this.stats) return;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // 1. Appointment Line Chart
    if (this.appointmentChartCanvas?.nativeElement && this.stats.appointmentsByMonth?.length > 0) {
      const ctx = this.appointmentChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.charts.push(new Chart(ctx, {
          type: 'line',
          data: {
            labels: this.stats.appointmentsByMonth.map(d => monthNames[parseInt(d.month) - 1] || d.month),
            datasets: [{
              label: 'Appointments',
              data: this.stats.appointmentsByMonth.map(d => d.count),
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: '#10b981'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
              x: { grid: { display: false } }
            }
          }
        }));
      }
    }

    // 2. Mode Donut Chart
    if (this.typeChartCanvas?.nativeElement && (this.stats.onlineCount > 0 || this.stats.inPersonCount > 0)) {
      const ctx = this.typeChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.charts.push(new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['In-Person', 'Online'],
            datasets: [{
              data: [this.stats.inPersonCount, this.stats.onlineCount],
              backgroundColor: ['#10b981', '#34d399'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: { legend: { display: false } }
          }
        }));
      }
    }

    // 3. Revenue Bar Chart
    if (this.revenueChartCanvas?.nativeElement && this.stats.revenueByMonth?.length > 0) {
      const ctx = this.revenueChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.charts.push(new Chart(ctx, {
          type: 'bar',
          data: {
            labels: this.stats.revenueByMonth.map(d => monthNames[parseInt(d.month) - 1] || d.month),
            datasets: [{
              label: 'Revenue (TND)',
              data: this.stats.revenueByMonth.map(d => d.amount),
              backgroundColor: '#10b981',
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { 
                beginAtZero: true,
                grid: { color: '#f1f5f9' },
                ticks: { callback: (val) => val + ' TND' }
              },
              x: { grid: { display: false } }
            }
          }
        }));
      }
    }
  }
}
