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
  userId = 0;
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
    console.log('=== DEBUG LOAD REQUESTS ===');
    console.log('userId brut:', this.userId);
    console.log('userId type:', typeof this.userId);
    
    if (!this.userId || this.userId <= 0) {
      console.error('Invalid user ID:', this.userId);
      this.isLoading = false;
      this.submitError = 'Unable to load requests: Invalid user ID. Please log in again.';
      return;
    }
    
    // S'assurer que userId est un nombre entier
    const cleanUserId = Math.floor(this.userId);
    console.log('cleanUserId:', cleanUserId);
    console.log('URL qui sera appelée:', `/springsecurity/api/lab-requests/patient/${cleanUserId}`);
    
    this.isLoading = true;
    this.labService.getByPatient(cleanUserId).subscribe({
      next: (data: LabRequestResponse[]) => {
        console.log('Données reçues:', data);
        this.requests = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err: unknown) => { 
        console.error('Error loading lab requests:', err); 
        console.error('Error details:', JSON.stringify(err, null, 2));
        this.isLoading = false;
        this.submitError = 'Failed to load lab requests. Please try again.';
      }
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
    if (!this.userId || this.userId <= 0) { 
      this.submitError = 'Session expired. Please log in again.'; 
      return; 
    }

    const v = this.form.value;
    const payload: LabRequestPayload = {
      patientId:     this.userId,
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