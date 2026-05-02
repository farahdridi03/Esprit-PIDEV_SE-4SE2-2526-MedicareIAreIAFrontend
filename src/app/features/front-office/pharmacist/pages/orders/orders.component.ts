import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../../../../services/toast.service';
import { PharmacyOrderService } from '../../../../../services/pharmacy-order.service';
import { AuthService } from '../../../../../services/auth.service';
import { UserService } from '../../../../../services/user.service';
import { PaymentService } from '../../../../../services/payment.service';
import { Subscription } from 'rxjs';
import {
    PharmacyOrderResponseDTO,
    UpdateOrderStatusDTO,
    RejectOrderDTO,
    OrderStatus
} from '../../../../../models/pharmacy-order.model';
import { DeliveryService } from '../../../../../services/delivery.service';
import { DeliveryAgency, DeliveryAgent } from '../../../../../models/pharmacy.model';
import { Delivery } from '../../../../../models/delivery.model';
import { DeliveryTrackingService } from '../../../../../services/delivery-tracking.service';
import { NotificationService } from '../../../../../services/notification.service';
import { NotificationType } from '../../../../../models/notification.model';
import { PaymentStatus } from '../../../../../models/payment.model';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit, OnDestroy {
    pharmacyId: number | null = null;
    pharmacyName: string = '';
    backendUrl = 'http://localhost:8081/springsecurity';

    orders: PharmacyOrderResponseDTO[] = [];
    filteredOrders: PharmacyOrderResponseDTO[] = [];
    orderPaymentStatus: Map<number, any> = new Map();

    isLoading = true;
    error = '';

    showRejectModal = false;
    selectedOrderId: number | null = null;
    rejectForm: FormGroup;
    dispatchForm: FormGroup;

    // Dispatch Modal properties
    showDispatchModal = false;
    currentDispatchOrderId: number | null = null;
    agencies: DeliveryAgency[] = [];
    agents: DeliveryAgent[] = [];
    isAssigning = false;

    // Filters
    statusFilter: OrderStatus | 'ALL' = 'ALL';
    searchTerm = '';

    // Pagination
    currentPage = 1;
    itemsPerPage = 10;

    private notifSub!: Subscription;

    constructor(
        private orderService: PharmacyOrderService,
        private authService: AuthService,
        private userService: UserService,
        private paymentService: PaymentService,
        private deliveryService: DeliveryService,
        private deliveryTrackingService: DeliveryTrackingService,
        private notificationService: NotificationService,
        private toastService: ToastService,
        private fb: FormBuilder
    ) {
        this.rejectForm = this.fb.group({
            reason: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1000)]]
        });
        this.dispatchForm = this.fb.group({
            agencyId: [null, Validators.required],
            agentId: [null, Validators.required]
        });
    }

    ngOnInit(): void {
        this.initOrders();
        this.initRealTimeUpdates();
    }

    ngOnDestroy(): void {
        if (this.notifSub) this.notifSub.unsubscribe();
        this.deliveryTrackingService.disconnect();
    }

    initOrders(): void {
        const userId = this.authService.getUserId();
        if (!userId) {
            this.error = 'User not authenticated.';
            this.isLoading = false;
            return;
        }

        this.userService.getById(userId).subscribe({
            next: (user) => {
                if (user.pharmacyId) {
                    this.pharmacyId = user.pharmacyId;
                    this.pharmacyName = user.pharmacyName || 'Pharmacy';
                    this.loadOrders();
                } else {
                    this.error = 'No pharmacy associated with this profile.';
                    this.isLoading = false;
                }
            },
            error: (err) => {
                this.error = 'Error retrieving user profile.';
                this.isLoading = false;
                console.error(err);
            }
        });
    }

    initRealTimeUpdates(): void {
        const email = this.authService.getUserEmail();
        if (email) {
            this.deliveryTrackingService.connectToUserNotifications(email);
            this.notifSub = this.notificationService.notifications$.subscribe(notifs => {
                if (notifs.length > 0) {
                    const latest = notifs[0];
                    if ((latest as any).type === NotificationType.PAYMENT_CONFIRMED ||
                        (latest as any).type === NotificationType.ORDER_CREATED) {
                        console.log('Real-time update: Reloading orders due to:', latest.type);
                        this.loadOrders();
                    }
                }
            });
        }
    }

    loadOrders(): void {
        if (!this.pharmacyId) return;
        this.isLoading = true;

        this.orderService.getOrdersByPharmacy(this.pharmacyId).subscribe({
            next: (data: PharmacyOrderResponseDTO[]) => {
                this.orders = data;
                this.loadPaymentStatuses();
                this.applyFilters();
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('Failed to load orders', err);
                this.error = 'Erreur lors du chargement des commandes.';
                this.toastService.error(this.error);
                this.isLoading = false;
            }
        });
    }

    loadPaymentStatuses(): void {
        this.orders.forEach(order => {
            this.paymentService.getPaymentByOrderId(order.id).subscribe({
                next: (payment) => {
                    this.orderPaymentStatus.set(order.id, payment);
                },
                error: () => {
                    this.orderPaymentStatus.set(order.id, null);
                }
            });
        });
    }

    applyFilters(): void {
        this.filteredOrders = this.orders.filter(order => {
            const matchStatus = this.statusFilter === 'ALL' || order.status === this.statusFilter;
            const matchSearch = this.searchTerm === '' ||
                order.id.toString().includes(this.searchTerm) ||
                order.patientId.toString().includes(this.searchTerm);
            return matchStatus && matchSearch;
        });
        this.currentPage = 1;
    }

    onStatusFilterChange(status: OrderStatus | 'ALL'): void {
        this.statusFilter = status;
        this.applyFilters();
    }

    onSearchChange(term: string): void {
        this.searchTerm = term;
        this.applyFilters();
    }

    updateStatus(orderId: number, status: OrderStatus): void {
        const dto: UpdateOrderStatusDTO = { status };
        if (confirm(`Êtes-vous sûr de vouloir passer le statut à ${status} ?`)) {
            this.orderService.updateOrderStatus(orderId, dto).subscribe({
                next: (updated: PharmacyOrderResponseDTO) => {
                    this.toastService.success(`Statut mis à jour : ${status}`);
                    this.loadOrders(); // Reload to update list
                },
                error: (err: any) => {
                    this.toastService.error('Erreur lors de la mise à jour du statut.');
                }
            });
        }
    }

    openRejectModal(orderId: number): void {
        this.selectedOrderId = orderId;
        this.showRejectModal = true;
    }

    closeRejectModal(): void {
        this.showRejectModal = false;
        this.selectedOrderId = null;
        this.rejectForm.reset();
    }

    confirmReject(): void {
        if (!this.selectedOrderId || this.rejectForm.invalid) {
            this.toastService.error('Veuillez saisir un motif de rejet valide.');
            return;
        }

        const reason = this.rejectForm.get('reason')?.value;
        const changedBy = this.authService.getUserFullName() || this.authService.getUserEmail() || 'PHARMACIST';
        const dto: RejectOrderDTO = {
            note: reason,
            changedBy: changedBy
        };
        this.orderService.rejectOrder(this.selectedOrderId, dto).subscribe({
            next: () => {
                this.toastService.success('Commande rejetée avec succès');
                this.closeRejectModal();
                this.loadOrders();
            },
            error: (err: any) => {
                console.error('Error rejecting order', err);
                const msg = err.error?.error || err.error?.message || 'Erreur lors du rejet de la commande.';
                this.toastService.error(msg);
                this.closeRejectModal();
            }
        });
    }

    openDispatchModal(orderId: number): void {
        this.currentDispatchOrderId = orderId;
        this.showDispatchModal = true;
        this.loadAgencies();
    }

    closeDispatchModal(): void {
        this.showDispatchModal = false;
        this.currentDispatchOrderId = null;
        this.dispatchForm.reset();
        this.agents = [];
    }

    loadAgencies(): void {
        this.deliveryService.getAgencies().subscribe({
            next: (data) => this.agencies = data,
            error: (err) => console.error('Error loading agencies', err)
        });
    }

    onAgencyChange(): void {
        const agencyId = this.dispatchForm.get('agencyId')?.value;
        if (agencyId) {
            this.deliveryService.getAgentsByAgency(agencyId).subscribe({
                next: (data) => {
                    this.agents = data;
                    this.dispatchForm.patchValue({ agentId: null });
                },
                error: (err) => console.error('Error loading agents', err)
            });
        } else {
            this.agents = [];
            this.dispatchForm.patchValue({ agentId: null });
        }
    }

    confirmDispatch(): void {
        if (!this.currentDispatchOrderId || this.dispatchForm.invalid) {
            this.toastService.error('Veuillez sélectionner une agence et un livreur.');
            return;
        }

        this.isAssigning = true;
        const agentId = this.dispatchForm.get('agentId')?.value;
        this.deliveryService.dispatchOrder(this.currentDispatchOrderId, agentId).subscribe({
            next: (delivery: Delivery) => {
                this.isAssigning = false;
                this.closeDispatchModal();
                this.loadOrders();
                this.toastService.success('Commande expédiée avec succès !');
            },
            error: (err) => {
                this.isAssigning = false;
                console.error('Dispatch error', err);
                const msg = err.error?.message || 'Erreur lors de la création de l\'expédition.';
                this.toastService.error(msg);
            }
        });
    }

    get paginatedOrders(): PharmacyOrderResponseDTO[] {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredOrders.slice(start, start + this.itemsPerPage);
    }

    get totalPages(): number {
        return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    prevPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    // ✅ Helper methods for payment status
    isPaymentCompleted(orderId: number): boolean {
        const payment = this.orderPaymentStatus.get(orderId);
        return payment && payment.status === 'COMPLETED';
    }

    getPaymentStatus(orderId: number): string {
        const payment = this.orderPaymentStatus.get(orderId);
        if (!payment) return 'No payment';
        return payment.status || 'Unknown';
    }

    canDispatchOrder(order: PharmacyOrderResponseDTO): boolean {
        return order.status === 'VALIDATED' && this.isPaymentCompleted(order.id);
    }
}
