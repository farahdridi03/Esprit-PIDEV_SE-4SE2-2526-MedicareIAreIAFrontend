import { Component, OnInit } from '@angular/core';
import { PharmacyOrderService } from '../../../../services/pharmacy-order.service';
import { OrderAgingDTO, EscalationResultDTO } from '../../../../models/pharmacy-order.model';

@Component({
  selector: 'app-admin-pharmacy-monitor',
  templateUrl: './admin-pharmacy-monitor.component.html',
  styleUrls: ['./admin-pharmacy-monitor.component.scss']
})
export class AdminPharmacyMonitorComponent implements OnInit {

  orders: OrderAgingDTO[] = [];
  isLoading = true;
  error = '';

  isTriggering = false;
  escalationResult: EscalationResultDTO | null = null;
  escalationError = '';

  get critical(): number { return this.orders.filter(o => o.urgencyLevel === 'CRITICAL').length; }
  get high(): number     { return this.orders.filter(o => o.urgencyLevel === 'HIGH').length; }
  get medium(): number   { return this.orders.filter(o => o.urgencyLevel === 'MEDIUM').length; }
  get low(): number      { return this.orders.filter(o => o.urgencyLevel === 'LOW').length; }

  constructor(private orderService: PharmacyOrderService) {}

  ngOnInit(): void {
    this.loadAging();
  }

  loadAging(): void {
    this.isLoading = true;
    this.error = '';
    this.orderService.getOrdersAging().subscribe({
      next: (data) => { this.orders = data; this.isLoading = false; },
      error: () => { this.error = 'Failed to load orders.'; this.isLoading = false; }
    });
  }

  triggerEscalation(): void {
    this.isTriggering = true;
    this.escalationResult = null;
    this.escalationError = '';
    this.orderService.triggerEscalation().subscribe({
      next: (result) => {
        this.escalationResult = result;
        this.isTriggering = false;
        this.loadAging();
      },
      error: () => {
        this.escalationError = 'Escalation failed.';
        this.isTriggering = false;
      }
    });
  }

  urgencyClass(level: string): string {
    const map: Record<string, string> = {
      LOW: 'ck-teal', MEDIUM: 'ck-amber', HIGH: 'ck-orange', CRITICAL: 'ck-rose'
    };
    return map[level] || '';
  }
}
