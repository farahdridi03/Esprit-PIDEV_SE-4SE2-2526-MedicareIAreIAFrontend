import { Component, OnInit } from '@angular/core';
import { HomecareService } from '../../../../services/homecare.service';
import { PharmacyOrderService } from '../../../../services/pharmacy-order.service';
import { ServiceRequest } from '../../../../models/homecare.model';
import { AssignmentResultDTO, ProviderScoreDTO, PharmacyOrderResponseDTO } from '../../../../models/pharmacy-order.model';

@Component({
  selector: 'app-admin-requests',
  templateUrl: './admin-requests.component.html',
  styleUrls: ['./admin-requests.component.scss']
})
export class AdminRequestsComponent implements OnInit {
  requests: ServiceRequest[] = [];
  filteredRequests: ServiceRequest[] = [];

  isLoading = true;
  error = '';
  searchQuery = '';
  filterStatus = 'ALL';

  // Auto-assign
  assigningId: number | null = null;
  assignSuccess: AssignmentResultDTO | null = null;
  assignError = '';

  // Rank providers modal
  showRankModal = false;
  rankLoading = false;
  rankedProviders: ProviderScoreDTO[] = [];
  selectedRequest: ServiceRequest | null = null;

  // Task 3 — Keyword search
  searchPharmacyName = '';
  searchOrderStatus = 'PENDING';
  orderSearchResults: PharmacyOrderResponseDTO[] = [];
  searchingOrders = false;
  orderSearchError = '';
  showOrderSearch = false;

  // Pagination
  currentPage = 1;
  pageSize = 8;

  get totalPages(): number { return Math.ceil(this.filteredRequests.length / this.pageSize); }
  get pageEnd(): number { return Math.min(this.currentPage * this.pageSize, this.filteredRequests.length); }
  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedRequests(): ServiceRequest[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRequests.slice(start, start + this.pageSize);
  }
  goToPage(p: number): void { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }
  countByStatus(status: string): number { return this.requests.filter(r => r.status === status).length; }

  constructor(
    private homecare: HomecareService,
    private orderService: PharmacyOrderService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.homecare.getAllRequests().subscribe({
      next: (data) => { this.requests = data; this.applyFilters(); this.isLoading = false; },
      error: () => { this.error = 'Failed to load requests list.'; this.isLoading = false; }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.filteredRequests = this.requests.filter(r => {
      const matchesSearch = !this.searchQuery ||
        r.patient?.firstName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        r.patient?.lastName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        r.service?.name?.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.filterStatus === 'ALL' || r.status === this.filterStatus;
      return matchesSearch && matchesStatus;
    });
  }

  // ── HomeCareAssignmentService ─────────────────────────────────────
  autoAssign(req: ServiceRequest): void {
    this.assigningId = req.id;
    this.assignSuccess = null;
    this.assignError = '';
    this.homecare.autoAssignRequest(req.id).subscribe({
      next: (result) => {
        this.assignSuccess = result;
        this.assigningId = null;
        this.loadRequests();
      },
      error: (err) => {
        this.assignError = err.error?.message || 'Auto-assign failed.';
        this.assigningId = null;
      }
    });
  }

  openRankModal(req: ServiceRequest): void {
    this.selectedRequest = req;
    this.showRankModal = true;
    this.rankLoading = true;
    this.rankedProviders = [];
    const dt = req.requestedDateTime ?? new Date().toISOString();
    this.homecare.rankProviders(req.service.id, dt).subscribe({
      next: (data) => { this.rankedProviders = data; this.rankLoading = false; },
      error: () => this.rankLoading = false
    });
  }

  closeRankModal(): void { this.showRankModal = false; this.selectedRequest = null; }

  // ── Task 3 — Keyword search ───────────────────────────────────────
  searchOrders(): void {
    if (!this.searchPharmacyName.trim()) return;
    this.searchingOrders = true;
    this.orderSearchError = '';
    this.orderSearchResults = [];
    this.orderService.searchByPharmacyNameAndStatus(this.searchPharmacyName, this.searchOrderStatus).subscribe({
      next: (data) => { this.orderSearchResults = data; this.searchingOrders = false; },
      error: () => { this.orderSearchError = 'Search failed.'; this.searchingOrders = false; }
    });
  }
}
