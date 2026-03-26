import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  laboratories: Laboratory[] = [];
  patientId = 0;
  today = '';

  drawerOpen    = false;
  drawerClosing = false;
  labsLoading   = false;
  editingId: number | null = null;

  isLoading     = false;
  isSubmitting  = false;
  submitSuccess = false;
  submitError   = '';
  form!: FormGroup;

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
  get isEditMode() { return this.editingId !== null; }

  constructor(
    private fb:          FormBuilder,
    private labService:  LabRequestService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.today     = new Date().toISOString().slice(0, 16);
    this.patientId = this.authService.getPatientId();
    console.log('patientId =', this.patientId);

    this.form = this.fb.group({
      laboratoryId:  [null, Validators.required],
      testType:      ['',   [Validators.required, Validators.minLength(3)]],
      scheduledAt:   ['',   Validators.required],
      clinicalNotes: ['']
    });

    this.loadRequests();
  }

  loadLaboratories(): void {
    this.labsLoading = true;
    this.labService.getLaboratories().subscribe({
      next: (labs: Laboratory[]) => { this.laboratories = labs; this.labsLoading = false; },
      error: (err: unknown)      => { console.error('Labs error:', err); this.labsLoading = false; }
    });
  }

  loadRequests(): void {
    if (!this.patientId) return;
    this.isLoading = true;
    this.labService.getByPatient(this.patientId).subscribe({
      next: (data: LabRequestResponse[]) => {
        this.requests = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err: unknown) => { console.error(err); this.isLoading = false; }
    });
  }

  applyFilters(): void {
    let result = [...this.requests];
    if (this.statusFilter !== 'ALL') {
      result = result.filter(r => r.status === this.statusFilter);
    }
    if (this.dateFilter !== 'ALL') {
      const days   = parseInt(this.dateFilter, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter(r => new Date(r.scheduledAt) >= cutoff);
    }
    this.filteredRequests = result;
  }

  setStatusFilter(v: string): void { this.statusFilter = v; this.applyFilters(); }
  setDateFilter(v: string):   void { this.dateFilter   = v; this.applyFilters(); }

  resetFilters(): void {
    this.statusFilter = 'ALL';
    this.dateFilter   = '30';
    this.applyFilters();
  }

  openDrawer(): void {
    this.editingId     = null;
    this.drawerClosing = false;
    this.drawerOpen    = true;
    this.submitError   = '';
    this.form.reset();
    this.loadLaboratories();
  }

  editRequest(req: LabRequestResponse): void {
    this.editingId     = req.id;
    this.drawerClosing = false;
    this.drawerOpen    = true;
    this.submitError   = '';
    this.loadLaboratories();
    this.form.patchValue({
      laboratoryId:  req.laboratoryId,
      testType:      req.testType,
      scheduledAt:   req.scheduledAt?.slice(0, 16),
      clinicalNotes: req.clinicalNotes || ''
    });
  }

  closeDrawer(): void {
    this.drawerClosing = true;
    setTimeout(() => {
      this.drawerOpen    = false;
      this.drawerClosing = false;
      this.editingId     = null;
      this.submitError   = '';
      this.form.reset();
    }, 300);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.patientId)   { this.submitError = 'Session expired. Please log in again.'; return; }

    const v = this.form.value;
    const payload: LabRequestPayload = {
      patientId:     this.patientId,
      laboratoryId:  Number(v.laboratoryId),
      testType:      v.testType.trim(),
      scheduledAt:   new Date(v.scheduledAt).toISOString().slice(0, 19),
      clinicalNotes: v.clinicalNotes || '',
      requestedBy:   'PATIENT',
      doctorId:      null
    };

    this.isSubmitting = true;

    const request$ = this.isEditMode
      ? this.labService.update(this.editingId!, payload)
      : this.labService.create(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting  = false;
        this.submitSuccess = true;
        this.closeDrawer();
        this.loadRequests();
        setTimeout(() => { this.submitSuccess = false; }, 4000);
      },
      error: (err: unknown) => {
        this.isSubmitting = false;
        const e = err as { error?: { message?: string } };
        this.submitError = e?.error?.message || 'An error occurred. Please try again.';
        console.error(err);
      }
    });
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