import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HomecareService } from '../../../../../services/homecare.service';
import { NotificationService } from '../../../../../services/notification.service';
import { ServiceRequest, CompleteRequestDTO } from '../../../../../models/homecare.model';
import { ToastService } from '../../../../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-provider-dashboard',
  templateUrl: './provider-dashboard.component.html',
  styleUrls: ['./provider-dashboard.component.scss']
})
export class ProviderDashboardComponent implements OnInit, OnDestroy {
  requests: ServiceRequest[] = [];
  isLoading = true;

  showCompleteModal = false;
  selectedRequestId: number | null = null;
  completeForm: FormGroup;

  stats = {
    pending: 0,
    active: 0,
    completed: 0
  };

  private notificationSub?: Subscription;

  constructor(
    private homecare: HomecareService,
    private notificationService: NotificationService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.completeForm = this.fb.group({
      providerNotes: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    this.loadRequests();

    // Subscribe to new notifications
    this.notificationSub = this.notificationService.notifications$.subscribe((notifications) => {
      // Check if there's a new HOMECARE request notification
      const hasNewHomecareRequest = notifications.some(n => n.type === 'NEW_HOMECARE_REQUEST');
      if (hasNewHomecareRequest) {
        // Reload requests to show the new request
        this.loadRequests();
      }
    });
  }

  ngOnDestroy(): void {
    this.notificationSub?.unsubscribe();
  }

  loadRequests(): void {
    this.homecare.getProviderRequests().subscribe({
      next: (data) => {
        this.requests = data;
        this.calculateStats();
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Échec du chargement des demandes assignées.');
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats = {
      pending: this.requests.filter(r => r.status === 'PENDING' || r.status === 'ACCEPTED').length,
      active: this.requests.filter(r => r.status === 'IN_PROGRESS').length,
      completed: this.requests.filter(r => r.status === 'COMPLETED').length
    };
  }

  acceptRequest(id: number): void {
    this.homecare.acceptRequest(id).subscribe({
      next: () => {
        this.toastService.success('Demande acceptée ! Le créneau est désormais réservé.');
        this.loadRequests();
      },
      error: () => this.toastService.error('Erreur lors de l\'acceptation.')
    });
  }

  declineRequest(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir décliner cette demande ?')) {
      this.homecare.declineRequest(id).subscribe({
        next: () => {
          this.toastService.warning('Demande déclinée.');
          this.loadRequests();
        },
        error: () => this.toastService.error('Erreur lors du refus.')
      });
    }
  }

  startRequest(id: number): void {
    this.homecare.startRequest(id).subscribe({
      next: () => {
        this.toastService.info('Intervention commencée. Le patient a été notifié.');
        this.loadRequests();
      },
      error: () => this.toastService.error('Erreur lors du démarrage.')
    });
  }

  completeRequest(id: number): void {
    this.selectedRequestId = id;
    this.showCompleteModal = true;
    this.completeForm.reset();
  }

  submitComplete(): void {
    if (this.completeForm.invalid || !this.selectedRequestId) return;

    const dto: CompleteRequestDTO = {
      providerNotes: this.completeForm.value.providerNotes
    };

    this.homecare.completeRequest(this.selectedRequestId, dto).subscribe({
      next: () => {
        this.toastService.success('Intervention marquée comme terminée !');
        this.showCompleteModal = false;
        this.loadRequests();
      },
      error: (err) => {
        const msg = err.error?.message || 'Erreur lors de la complétion.';
        this.toastService.error(msg);
      }
    });
  }

  closeCompleteModal(): void {
    this.showCompleteModal = false;
    this.selectedRequestId = null;
  }
}
