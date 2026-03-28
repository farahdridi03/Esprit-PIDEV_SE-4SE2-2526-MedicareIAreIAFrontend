import { Component, OnInit } from '@angular/core';
import { HomecareService } from '../../../../../services/homecare.service';
import { ServiceRequest } from '../../../../../models/homecare.model';

@Component({
  selector: 'app-provider-dashboard',
  templateUrl: './provider-dashboard.component.html',
  styleUrls: ['./provider-dashboard.component.scss']
})
export class ProviderDashboardComponent implements OnInit {
  requests: ServiceRequest[] = [];
  isLoading = true;
  error = '';
  successMessage = '';

  stats = {
    pending: 0,
    active: 0,
    completed: 0
  };

  constructor(private homecare: HomecareService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.homecare.getProviderRequests().subscribe({
      next: (data) => {
        this.requests = data;
        this.calculateStats();
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load assigned requests.';
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
    if (confirm('Accepter cette demande ? Cette plage horaire sera marquée comme occupée dans votre calendrier.')) {
      this.homecare.acceptRequest(id).subscribe({
        next: () => {
          this.successMessage = 'Demande acceptée ! Le créneau est désormais réservé dans votre planning.';
          this.loadRequests();
          // Clear message after 5s
          setTimeout(() => this.successMessage = '', 5000);
        },
        error: () => this.error = 'Erreur lors de l\'acceptation.'
      });
    }
  }

  declineRequest(id: number): void {
    if (confirm('Are you sure you want to decline this request?')) {
      this.homecare.declineRequest(id).subscribe(() => this.loadRequests());
    }
  }

  startRequest(id: number): void {
    if (confirm('Are you ready to start this intervention? This will notify the patient.')) {
      this.homecare.startRequest(id).subscribe(() => this.loadRequests());
    }
  }

  completeRequest(id: number): void {
    if (confirm('Mark this intervention as completed?')) {
      this.homecare.completeRequest(id).subscribe(() => this.loadRequests());
    }
  }
}
