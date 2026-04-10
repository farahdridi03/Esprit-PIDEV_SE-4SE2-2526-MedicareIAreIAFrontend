import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { LaboratoryService } from '../../../../services/laboratory.service';
import { LaboratoryResponse } from '../../../../models/laboratory.model';

@Component({
  selector: 'app-admin-laboratory-list',
  templateUrl: './laboratory-list.component.html',
  styleUrls: ['./laboratory-list.component.scss']
})
export class AdminLaboratoryListComponent implements OnInit, OnDestroy {
  labs: LaboratoryResponse[] = [];
  filteredLabs: LaboratoryResponse[] = [];
  pagedLabs: LaboratoryResponse[] = [];
  isLoading = false;
  errorMsg = '';

  totalLabs = 0;
  activeLabs = 0;
  pendingLabs = 0;

  pageSize = 5;
  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];

  searchQuery = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  showConfirm = false;
  deleteTargetId: number | null = null;

  snackbarMsg = '';
  snackbarType: 'success' | 'error' = 'success';
  snackbarVisible = false;

  constructor(private labService: LaboratoryService, private router: Router) {}

  ngOnInit(): void {
    this.loadLabs();
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      if (query.trim()) {
        this.isLoading = true;
        this.labService.searchByName(query).subscribe({
          next: (data) => {
            this.filteredLabs = data;
            this.computePages();
            this.setPage(1);
            this.isLoading = false;
          },
          error: () => { this.isLoading = false; }
        });
      } else {
        this.filteredLabs = [...this.labs];
        this.computePages();
        this.setPage(1);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLabs(): void {
    this.isLoading = true;
    this.labService.getAll().subscribe({
      next: (data) => {
        this.labs = data;
        this.filteredLabs = [...data];
        this.totalLabs = data.length;
        this.activeLabs = data.filter(l => l.isActive).length;
        this.pendingLabs = data.filter(l => !l.isActive).length;
        this.computePages();
        this.setPage(1);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = 'Failed to load laboratories.';
        this.isLoading = false;
      }
    });
  }

  onSearch(value: string): void {
    this.searchQuery = value;
    this.searchSubject.next(value);
  }

  computePages(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredLabs.length / this.pageSize));
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    const start = (page - 1) * this.pageSize;
    this.pagedLabs = this.filteredLabs.slice(start, start + this.pageSize);
  }

  get showingFrom(): number {
    return this.filteredLabs.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }
  get showingTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredLabs.length);
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getLabId(id: number): string {
    return 'LAB-' + String(id).padStart(3, '0');
  }

  getAvatarColor(name: string): string {
    const colors = ['#4f46e5','#0d9488','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  goToAdd(): void {
    this.router.navigate(['/admin/laboratories/new']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/admin/laboratories/edit', id]);
  }

  toggleActive(lab: LaboratoryResponse): void {
    this.labService.toggleActive(lab.id).subscribe({
      next: (updated) => {
        const idx = this.labs.findIndex(l => l.id === lab.id);
        if (idx !== -1) this.labs[idx] = updated;
        const fidx = this.filteredLabs.findIndex(l => l.id === lab.id);
        if (fidx !== -1) this.filteredLabs[fidx] = updated;
        const pidx = this.pagedLabs.findIndex(l => l.id === lab.id);
        if (pidx !== -1) this.pagedLabs[pidx] = updated;
        this.activeLabs = this.labs.filter(l => l.isActive).length;
        this.pendingLabs = this.labs.filter(l => !l.isActive).length;
      },
      error: () => this.showSnackbar('Failed to update status.', 'error')
    });
  }

  confirmDelete(id: number): void {
    this.deleteTargetId = id;
    this.showConfirm = true;
  }

  cancelDelete(): void {
    this.showConfirm = false;
    this.deleteTargetId = null;
  }

  doDelete(): void {
    if (this.deleteTargetId == null) return;
    this.labService.delete(this.deleteTargetId).subscribe({
      next: () => {
        this.showConfirm = false;
        this.deleteTargetId = null;
        this.showSnackbar('Laboratory deleted successfully.', 'success');
        this.loadLabs();
      },
      error: () => {
        this.showConfirm = false;
        this.showSnackbar('Failed to delete laboratory.', 'error');
      }
    });
  }

  showSnackbar(msg: string, type: 'success' | 'error'): void {
    this.snackbarMsg = msg;
    this.snackbarType = type;
    this.snackbarVisible = true;
    setTimeout(() => this.snackbarVisible = false, 3000);
  }
}