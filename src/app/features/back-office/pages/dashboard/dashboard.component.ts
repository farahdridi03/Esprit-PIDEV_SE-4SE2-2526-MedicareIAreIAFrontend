import { Component, AfterViewInit, OnInit } from '@angular/core';
import { AdminService, GlobalStatsDTO } from '../../../../services/admin.service';

declare var Chart: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  stats: GlobalStatsDTO | null = null;
  private roleChartInstance: any = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getGlobalStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.drawRoleChart();
      },
      error: (err) => console.error('Failed to load global stats', err)
    });
  }


  ngAfterViewInit(): void {
    this.drawGrowthChart();
  }

  private drawGrowthChart(): void {
    const gCtx = document.getElementById('growthChart') as HTMLCanvasElement;
    if (!gCtx) return;
    new Chart(gCtx.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        datasets: [{
          label: 'Users',
          data: [4200, 6800, 9500, 12300, 15800, 18200, 21000, 24891],
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79,70,229,0.07)',
          borderWidth: 2.5,
          pointBackgroundColor: '#4f46e5',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4
        }, {
          label: 'Orders Delivered',
          data: [8, 22, 41, 68, 95, 130, 174, this.stats?.deliveredOrders ?? 180],
          borderColor: '#0d9488',
          backgroundColor: 'rgba(13,148,136,0.05)',
          borderWidth: 2,
          pointBackgroundColor: '#0d9488',
          pointRadius: 3,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top', labels: { font: { family: 'Outfit', size: 11 }, boxWidth: 10, color: '#6b6b8a' } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Outfit', size: 11 }, color: '#a8a8c0' }, border: { display: false } },
          y: { grid: { color: '#ebebf5', lineWidth: 1 }, ticks: { font: { family: 'Outfit', size: 11 }, color: '#a8a8c0' }, border: { display: false } }
        }
      }
    });
  }

  private drawRoleChart(): void {
    const rCtx = document.getElementById('roleChart') as HTMLCanvasElement;
    if (!rCtx || !this.stats) return;

    if (this.roleChartInstance) {
      this.roleChartInstance.destroy();
    }

    this.roleChartInstance = new Chart(rCtx.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Patients', 'Pharmacists', 'Providers', 'Doctors', 'Admins'],
        datasets: [{
          data: [
            this.stats.patients,
            this.stats.pharmacists,
            this.stats.providers,
            this.stats.doctors,
            this.stats.admins
          ],
          backgroundColor: ['#4f46e5', '#0d9488', '#7c3aed', '#f59e0b', '#ef4444'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: true, position: 'right', labels: { font: { family: 'Outfit', size: 11 }, boxWidth: 10, color: '#6b6b8a', padding: 10 } }
        }
      }
    });
  }
}

