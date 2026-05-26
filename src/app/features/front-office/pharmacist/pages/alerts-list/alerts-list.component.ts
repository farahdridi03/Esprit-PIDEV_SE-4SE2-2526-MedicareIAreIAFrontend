import { Component, OnInit } from '@angular/core';
import { StockService } from '../../../../../services/stock.service';
import { StockAlert } from '../../../../../models/stock.model';

@Component({
  selector: 'app-alerts-list',
  templateUrl: './alerts-list.component.html'
})
export class AlertsListComponent implements OnInit {
  alerts: StockAlert[] = [];
  loading = false;

  constructor(private stockService: StockService) { }

  ngOnInit() {
    this.loadAlerts();
  }

  loadAlerts() {
    this.loading = true;
    this.stockService.getAllOpenAlerts().subscribe({
      next: res => { this.alerts = res; this.loading = false; },
      error: err => { console.error(err); this.loading = false; }
    });
  }

  resolveAlert(id: number) {
    if (confirm('Mark this alert as resolved?')) {
      this.loading = true;
      this.stockService.resolveAlert(id).subscribe({
        next: () => this.loadAlerts(),
        error: err => { console.error(err); this.loading = false; }
      });
    }
  }
}