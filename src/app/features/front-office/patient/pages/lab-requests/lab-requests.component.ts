import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  LabRequestService,
  LabRequestResponse,
  LabRequestPayload,
  Laboratory
} from './lab-request.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-lab-requests',
  templateUrl: './lab-requests.component.html',
  styleUrls: ['./lab-requests.component.scss']
})
export class LabRequestsComponent implements OnInit {

  requests: LabRequestResponse[] = [];
  filteredRequests: LabRequestResponse[] = [];
  userId = 0;
  today = '';

  isLoading     = false;
  submitError   = '';

  statusFilter = 'ALL';
  dateFilter   = '30';

  readonly statusOptions = [
    { value: 'ALL',         label: 'All Statuses' },
    { value: 'PENDING',     label: 'Pending'       },
    { value: 'IN_PROGRESS', label: 'In Progress'   },
    { value: 'CONFIRMED',   label: 'Confirmed'     },
    { value: 'COMPLETED',   label: 'Completed'     },
    { value: 'CANCELLED',   label: 'Cancelled'     },
  ];

  get total()      { return this.requests.length; }
  get pending()    { return this.requests.filter(r => r.status === 'PENDING').length; }
  get scheduled()  { return this.requests.filter(r => r.status === 'IN_PROGRESS').length; }
  get completed()  { return this.requests.filter(r => r.status === 'COMPLETED').length; }
  get isEditMode() { return false; }

  constructor(
    private router:      Router,
    private labService:  LabRequestService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.today     = new Date().toISOString().slice(0, 16);
    this.userId = this.authService.getPatientId();
    console.log('userId =', this.userId);
    
    // Vérifier si l'utilisateur est authentifié
    if (!this.authService.isAuthenticated()) {
      console.error('User not authenticated');
      this.submitError = 'You are not authenticated. Please log in again.';
      return;
    }
    
    // Vérifier le token
    const token = this.authService.getToken();
    console.log('Token exists:', !!token);
    if (token) {
      console.log('Token length:', token.length);
      console.log('Token starts with Bearer:', token.startsWith('Bearer'));
    }

    this.loadRequests();
  }

  navigateToDashboard(): void {
    this.router.navigate(['/front/patient/dashboard']);
  }

  goToCreate(): void {
    this.router.navigate(['/front/patient/lab-requests/new']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/front/patient/lab-requests/edit', id]);
  }

  loadRequests(): void {
    if (!this.userId || this.userId <= 0) {
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    this.labService.getByPatient(this.userId).subscribe({
      next: (data: LabRequestResponse[]) => {
        this.requests = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err: unknown) => { 
        console.error('Error loading lab requests:', err); 
        this.isLoading = false;
        this.submitError = 'Failed to load lab requests.';
      }
    });
  }

  applyFilters(): void {
    let result = [...this.requests];
    if (this.statusFilter !== 'ALL') {
      result = result.filter(r => r.status === this.statusFilter);
    }
    if (this.dateFilter !== 'ALL') {
      const days = parseInt(this.dateFilter, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter(r => new Date(r.scheduledAt) >= cutoff);
    }
    this.filteredRequests = result;
  }

  setStatusFilter(v: string): void { this.statusFilter = v; this.applyFilters(); }
  setDateFilter(v: string): void { this.dateFilter = v; this.applyFilters(); }

  resetFilters(): void {
    this.statusFilter = 'ALL';
    this.dateFilter   = '30';
    this.applyFilters();
  }

  deleteRequest(id: number): void {
    if (!confirm('Delete this request permanently? This action cannot be undone.')) return;
    this.labService.delete(id).subscribe({
      next: ()              => this.loadRequests(),
      error: (err: unknown) => console.error('Delete error:', err)
    });
  }

  cancelRequest(id: number): void {
    if (!confirm('Cancel this lab request?')) return;
    this.labService.cancel(id).subscribe({
      next: ()              => this.loadRequests(),
      error: (err: unknown) => console.error('Cancel error:', err)
    });
  }

  statusClass(s: string): string {
    const map: Record<string, string> = {
      PENDING:     'badge badge--pending',
      CONFIRMED:   'badge badge--confirmed',
      IN_PROGRESS: 'badge badge--progress',
      COMPLETED:   'badge badge--completed',
      CANCELLED:   'badge badge--cancelled',
    };
    return map[s] || 'badge';
  }

  statusLabel(s: string): string {
    return s?.replace('_', ' ') || s;
  }

  formatRelative(dateStr: string): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const h    = Math.floor(diff / 36e5);
    const d    = Math.floor(h / 24);
    if (h < 1)  return 'Just now';
    if (h < 24) return `${h}h ago`;
    if (d < 7)  return `${d}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }
}