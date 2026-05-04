import { Component, OnInit } from '@angular/core';
import { PharmacyOrderService } from '../../../../../services/pharmacy-order.service';
import { AuthService } from '../../../../../services/auth.service';
import { PharmacyOrderResponseDTO } from '../../../../../models/pharmacy-order.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pharmacy-order-list',
  templateUrl: './pharmacy-order-list.component.html',
  styleUrls: ['./pharmacy-order-list.component.scss']
})
export class PharmacyOrderListComponent implements OnInit {
  orders: PharmacyOrderResponseDTO[] = [];
  isLoading = true;
  error = '';

  // Pagination
  currentPage = 1;
  pageSize = 5;

  get totalPages(): number {
    return Math.ceil(this.orders.length / this.pageSize);
  }

  get pagedOrders(): PharmacyOrderResponseDTO[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.orders.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.orders.length);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  constructor(
    private orderService: PharmacyOrderService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const userId = this.authService.getUserId();
    const role = this.authService.getUserRole();

    if (!userId || role !== 'PATIENT') {
      this.error = 'User not authenticated as a patient';
      this.isLoading = false;
      return;
    }

    this.orderService.getOrdersByPatient(userId).subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading orders', err);
        if (err.status === 403) {
          this.error = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        } else {
          this.error = 'Failed to load your orders. Please try again later.';
        }
        this.isLoading = false;
      }
    });
  }

  viewDetails(orderId: number): void {
    this.router.navigate(['/front/patient/pharmacy-orders', orderId]);
  }

  goToNewOrder(): void {
    this.router.navigate(['/front/patient/pharmacy-orders/new']);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'badge-warning';
      case 'VALIDATED': return 'badge-primary';
      case 'DELIVERED': return 'badge-success';
      case 'CANCELLED':
      case 'REJECTED': return 'badge-danger';
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY': return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'En Attente',
      'VALIDATED': 'Validé',
      'DELIVERY_REQUESTED': 'Livraison Demandée',
      'ASSIGNING': 'Recherche Livreur',
      'IN_TRANSIT': 'En Transit',
      'OUT_FOR_DELIVERY': 'En Cours de Livraison',
      'DELIVERED': 'Livré',
      'CANCELLED': 'Annulé',
      'REJECTED': 'Rejeté'
    };
    return labels[status] || status;
  }

  showAlert(): void {
    this.goToNewOrder();
  }
}
