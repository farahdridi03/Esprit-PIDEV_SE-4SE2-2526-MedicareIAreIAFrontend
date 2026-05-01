import { Component, OnInit } from '@angular/core';
import { StockService } from '../../../../../services/stock.service';
import { StockAlert } from '../../../../../models/stock.model';

@Component({
  selector: 'app-alerts-list',
  templateUrl: './alerts-list.component.html',
  styleUrls: ['./alerts-list.component.scss']
})
export class AlertsListComponent implements OnInit {
  alerts: StockAlert[] = [];
  loading = false;
  error: string | null = null;
  resolvingId: number | null = null;

  currentPage = 1; pageSize = 6;
  get totalPages() { return Math.ceil(this.alerts.length / this.pageSize); }
  get pagedAlerts() { const s = (this.currentPage - 1) * this.pageSize; return this.alerts.slice(s, s + this.pageSize); }
  get pages() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pageEnd() { return Math.min(this.currentPage * this.pageSize, this.alerts.length); }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.loading = true;
    this.error = null;
    this.stockService.getAllOpenAlerts().subscribe({
      next: (res) => {
        this.alerts = res;
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load alerts', err);
        this.error = 'Failed to load alerts.';
        this.loading = false;
      }
    });
  }

  resolveAlert(alertId: number): void {
    this.resolvingId = alertId;
    this.stockService.resolveAlert(alertId).subscribe({
      next: () => {
        this.resolvingId = null;
        this.loadAlerts();
      },
      error: (err) => {
        console.error('Failed to resolve alert', err);
        this.resolvingId = null;
      }
    });
  }
}
