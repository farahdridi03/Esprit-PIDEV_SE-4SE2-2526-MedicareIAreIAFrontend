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
          this.error = 'Échec du chargement de vos commandes. Veuillez réessayer plus tard.';
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
