import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LabRequestService, Laboratory, LabRequestPayload } from '../lab-request.service';
import { AuthService } from '../../../../../../services/auth.service';

@Component({
  selector: 'app-lab-request-form',
  templateUrl: './lab-request-form.component.html',
  styleUrls: ['./lab-request-form.component.scss']
})
export class PatientLabRequestFormComponent implements OnInit {
  form!: FormGroup;
  laboratories: Laboratory[] = [];
  isLoading = false;
  isSubmitting = false;
  isEditMode = false;
  requestId: number | null = null;
  submitError = '';
  today = new Date().toISOString().slice(0, 16);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private labService: LabRequestService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadLaboratories();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.requestId = +params['id'];
        this.loadRequestData(this.requestId);
      }
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      laboratoryId: [null, Validators.required],
      testType: ['', [Validators.required, Validators.minLength(3)]],
      scheduledAt: ['', Validators.required],
      clinicalNotes: ['']
    });
  }

  private loadLaboratories(): void {
    this.labService.getLaboratories().subscribe({
      next: (labs) => this.laboratories = labs,
      error: (err) => console.error('Error loading labs:', err)
    });
  }

  private loadRequestData(id: number): void {
    this.isLoading = true;
    this.labService.getById(id).subscribe({
      next: (req) => {
        if (req) {
          this.form.patchValue({
            laboratoryId: req.laboratoryId,
            testType: req.testType,
            scheduledAt: req.scheduledAt?.slice(0, 16),
            clinicalNotes: req.clinicalNotes || ''
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading request:', err);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const patientId = this.authService.getPatientId();
    if (!patientId) {
      this.submitError = 'Session expired. Please log in again.';
      return;
    }

    const v = this.form.value;
    const payload: LabRequestPayload = {
      patientId: patientId,
      laboratoryId: Number(v.laboratoryId),
      testType: v.testType.trim(),
      scheduledAt: new Date(v.scheduledAt).toISOString().slice(0, 19),
      clinicalNotes: v.clinicalNotes || '',
      requestedBy: 'PATIENT',
      doctorId: null
    };

    this.isSubmitting = true;
    const request$ = this.isEditMode && this.requestId
      ? this.labService.update(this.requestId, payload)
      : this.labService.create(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/front/patient/lab-requests']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err?.error?.message || 'Failed to submit request.';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/front/patient/lab-requests']);
  }
}
