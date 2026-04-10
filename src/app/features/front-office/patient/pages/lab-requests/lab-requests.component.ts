import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LabRequestService, LabRequestResponse } from './lab-request.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-patient-lab-requests',
  templateUrl: './lab-requests.component.html',
  styleUrls: ['./lab-requests.component.scss']
})
export class PatientLabRequestsComponent implements OnInit {
  labRequests: LabRequestResponse[] = [];
  filteredRequests: LabRequestResponse[] = [];
  isLoading = false;
  submitError = '';

  // Stats
  total = 0;
  pending = 0;
  scheduled = 0;
  completed = 0;

  // Filters
  statusFilter = 'ALL';
  dateFilter = 'ALL';
  statusOptions = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  constructor(
    private labService: LabRequestService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    const patientId = this.authService.getPatientId();
    if (!patientId) {
      this.submitError = 'Session expired. Please log in again.';
      return;
    }
    this.isLoading = true;
    this.labService.getByPatient(patientId).subscribe({
      next: (data) => {
        this.labRequests = data || [];
        this.applyFilters();
        this.calculateStats();
        this.isLoading = false;
      },
      error: () => {
        this.submitError = 'Failed to load laboratory requests.';
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    if (!this.labRequests) return;
    this.total = this.labRequests.length;
    this.pending = this.labRequests.filter(r => r.status?.toUpperCase() === 'PENDING').length;
    this.scheduled = this.labRequests.filter(r => r.status?.toUpperCase() === 'PROCESSING').length;
    this.completed = this.labRequests.filter(r => r.status?.toUpperCase() === 'COMPLETED').length;
  }

  applyFilters(): void {
    if (!this.labRequests) {
      this.filteredRequests = [];
      return;
    }
    let result = [...this.labRequests];
    if (this.statusFilter !== 'ALL') {
      result = result.filter(r => r.status?.toUpperCase() === this.statusFilter);
    }
    // Date filter logic (simplified)
    if (this.dateFilter !== 'ALL') {
      const days = parseInt(this.dateFilter, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter(r => new Date(r.scheduledAt) >= cutoff);
    }
    this.filteredRequests = result.sort((a, b) =>
      new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );
  }

  setStatusFilter(value: any): void {
    // If it's a string, use it directly, if it's an event, extract value
    const val = typeof value === 'string' ? value : value?.target?.value;
    if (val) {
      this.statusFilter = val;
      this.applyFilters();
    }
  }

  setDateFilter(value: any): void {
    const val = typeof value === 'string' ? value : value?.target?.value;
    if (val) {
      this.dateFilter = val;
      this.applyFilters();
    }
  }

  resetFilters(): void {
    this.statusFilter = 'ALL';
    this.dateFilter = 'ALL';
    this.applyFilters();
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

  cancelRequest(id: number): void {
    // Logic for cancelling
  }

  deleteRequest(id: number): void {
    // Logic for deleting
  }

  statusClass(status: string): string {
    const s = status?.toUpperCase();
    if (s === 'PENDING') return 'status-badge status-badge--pending';
    if (s === 'PROCESSING') return 'status-badge status-badge--processing';
    if (s === 'COMPLETED') return 'status-badge status-badge--completed';
    if (s === 'CANCELLED') return 'status-badge status-badge--cancelled';
    return 'status-badge';
  }

  statusLabel(status: string): string {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  formatRelative(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 0) return 'Future';
    return `${days} days ago`;
  }
}