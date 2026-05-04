import { Component, OnInit } from '@angular/core';
import { UserService, UserProfile } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { PharmacyOrderService } from '../../../../../services/pharmacy-order.service';
import { PharmacyStatsDTO, ProductSalesStatsDTO } from '../../../../../models/pharmacy-order.model';

declare var Chart: any;

@Component({
  selector: 'app-pharmacist-dashboard',
  templateUrl: './pharmacist-dashboard.component.html',
  styleUrls: ['./pharmacist-dashboard.component.scss']
})
export class PharmacistDashboardComponent implements OnInit {
  fullName: string = '';
  pharmacyId: number | null = null;
  stats: PharmacyStatsDTO | null = null;
  productSales: ProductSalesStatsDTO[] = [];
  loadingProductSales = false;

  private statusChart: any = null;
  private revenueChart: any = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private orderService: PharmacyOrderService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.userService.getProfile().subscribe({
      next: (user: UserProfile) => {
        if (user && user.fullName) this.fullName = user.fullName;
        if (user && user.pharmacyId) {
          this.pharmacyId = user.pharmacyId;
          this.loadStats();
          this.loadProductSales();
        }
      },
      error: (err: any) => console.error('Error fetching pharmacist profile', err)
    });
  }

  loadStats(): void {
    if (!this.pharmacyId) return;
    this.orderService.getPharmacyStats(this.pharmacyId).subscribe({
      next: (data) => {
        this.stats = data;
        setTimeout(() => this.drawStatusChart(), 100);
      },
      error: (err) => console.error('Error loading stats', err)
    });
  }

  loadProductSales(): void {
    if (!this.pharmacyId) return;
    this.loadingProductSales = true;
    this.orderService.getProductSalesStats(this.pharmacyId).subscribe({
      next: (data) => {
        this.productSales = data;
        this.loadingProductSales = false;
        setTimeout(() => this.drawRevenueChart(), 100);
      },
      error: () => this.loadingProductSales = false
    });
  }

  private drawStatusChart(): void {
    const canvas = document.getElementById('statusChart') as HTMLCanvasElement;
    if (!canvas || !this.stats) return;
    if (this.statusChart) this.statusChart.destroy();

    this.statusChart = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'Validated', 'Delivered', 'Rejected', 'Cancelled'],
        datasets: [{
          data: [
            this.stats.pendingOrders,
            this.stats.validatedOrders,
            this.stats.deliveredOrders,
            this.stats.rejectedOrders ?? 0,
            this.stats.cancelledOrders ?? 0
          ],
          backgroundColor: ['#f59e0b', '#4f46e5', '#10b981', '#ef4444', '#94a3b8'],
          borderWidth: 0,
          hoverOffset: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: { font: { size: 11 }, boxWidth: 10, padding: 8, color: '#6b6b8a' }
          }
        }
      }
    });
  }

  private drawRevenueChart(): void {
    const canvas = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!canvas || this.productSales.length === 0) return;
    if (this.revenueChart) this.revenueChart.destroy();

    const top5 = this.productSales.slice(0, 5);
    this.revenueChart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: top5.map(p => p.productName),
        datasets: [
          {
            label: 'Revenue (TND)',
            data: top5.map(p => p.totalRevenue),
            backgroundColor: 'rgba(79,70,229,0.75)',
            borderRadius: 6,
            yAxisID: 'y'
          },
          {
            label: 'Units Sold',
            data: top5.map(p => p.totalQuantitySold),
            backgroundColor: 'rgba(13,148,136,0.65)',
            borderRadius: 6,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top', labels: { font: { size: 11 }, boxWidth: 10, color: '#6b6b8a' } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#a8a8c0' }, border: { display: false } },
          y: { position: 'left', grid: { color: '#ebebf5' }, ticks: { font: { size: 10 }, color: '#a8a8c0' }, border: { display: false } },
          y1: { position: 'right', grid: { display: false }, ticks: { font: { size: 10 }, color: '#a8a8c0' }, border: { display: false } }
        }
      }
    });
  }

  private loadUserInfo() {
    const fullName = this.authService.getUserFullName();
    if (fullName) this.fullName = fullName;
  }
}
