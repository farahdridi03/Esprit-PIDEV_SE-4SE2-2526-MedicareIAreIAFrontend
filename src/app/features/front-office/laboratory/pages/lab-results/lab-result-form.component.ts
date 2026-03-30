import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LabResultService, LabResultRequest, LabResultResponse } from '../../../../../services/lab-result.service';
import { LabTestResponse } from '../../../../../services/lab-test.service';

@Component({
  selector: 'app-lab-result-form',
  templateUrl: './lab-result-form.component.html'
})
export class LabResultFormComponent implements OnInit {

  @Input() editResult: LabResultResponse | null = null;
  @Input() selectedLabTest: LabTestResponse | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  pendingRequests: any[] = [];
  selectedRequest: any = null;
  isSubmitting = false;
  errorMessage = '';

  form = {
    labRequestId: null as number | null,
    resultData: '',
    technicianName: '',
    verifiedBy: '',
    isAbnormal: false,
    abnormalFindings: '',
    status: 'COMPLETED'
  };

  get isEditMode(): boolean { return !!this.editResult; }

  // Validation methods
  isValidTechnicianName(): boolean {
    if (!this.form.technicianName) return false;
    if (this.form.technicianName.length < 3) return false;
    const pattern = /^[a-zA-Z\s\-']+$/;
    return pattern.test(this.form.technicianName);
  }

  isValidVerifiedBy(): boolean {
    if (!this.form.verifiedBy) return true; // Optional field
    if (this.form.verifiedBy.length > 100) return false;
    const pattern = /^[a-zA-Z\s\-']*$/;
    return pattern.test(this.form.verifiedBy);
  }

  hasVerifiedByError(): boolean {
    return !!(this.form.verifiedBy && (
      this.form.verifiedBy.length > 100 || 
      !/^[a-zA-Z\s\-']*$/.test(this.form.verifiedBy)
    ));
  }

  hasTechnicianNameError(): boolean {
    return !this.form.technicianName || 
           this.form.technicianName.length < 3 || 
           !/^[a-zA-Z\s\-']+$/.test(this.form.technicianName);
  }

  constructor(private labResultService: LabResultService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPendingRequests();
    if (this.editResult) {
      this.form = {
        labRequestId: this.editResult.labRequestId,
        resultData: this.editResult.resultData || '',
        technicianName: this.editResult.technicianName || '',
        verifiedBy: this.editResult.verifiedBy || '',
        isAbnormal: this.editResult.isAbnormal || false,
        abnormalFindings: this.editResult.abnormalFindings || '',
        status: this.editResult.status || 'COMPLETED'
      };
    }
  }

  loadPendingRequests(): void {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get<any[]>(
      'http://localhost:8081/springsecurity/api/lab-requests/status/PENDING',
      { headers }
    ).subscribe({
      next: (data) => { this.pendingRequests = data; },
      error: (err) => console.error(err)
    });
  }

  onRequestChange(): void {
    this.selectedRequest = this.pendingRequests
      .find(r => r.id === Number(this.form.labRequestId));
  }

  onSubmit(): void {
    if (!this.form.labRequestId || !this.form.resultData || !this.form.technicianName) {
      this.errorMessage = 'Please fill all required fields.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    const request: LabResultRequest = {
      labRequestId: Number(this.form.labRequestId),
      resultData: this.form.resultData,
      technicianName: this.form.technicianName,
      verifiedBy: this.form.verifiedBy || undefined,
      isAbnormal: this.form.isAbnormal,
      abnormalFindings: this.form.abnormalFindings || undefined,
      status: this.form.status
    };

    const call$ = this.isEditMode
      ? this.labResultService.update(this.editResult!.id, request)
      : this.labResultService.create(request);

    call$.subscribe({
      next: () => { this.isSubmitting = false; this.saved.emit(); },
      error: (err: any) => {
        this.isSubmitting = false;
        this.errorMessage = 'Error saving. Please try again.';
        console.error(err);
      }
    });
  }
}
