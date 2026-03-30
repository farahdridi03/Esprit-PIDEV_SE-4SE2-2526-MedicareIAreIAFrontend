import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LabTestService, LabTestResponse, LabTestRequest } from '../../../../services/lab-test.service';
import { LabRequestResponse } from '../../../../services/lab-request.service';

@Component({
  selector: 'app-lab-test-form',
  templateUrl: './lab-test-form.component.html',
  styleUrls: ['./lab-test-form.component.scss']
})
export class LabTestFormComponent {
  @Input() editTest: LabTestResponse | null = null;
  @Input() selectedRequest: LabRequestResponse | null = null;
  @Input() laboratoryId: number | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form: FormGroup;
  isSubmitting = false;
  submitError = '';
  isEditMode = false;
  isFromRequest = false;

  readonly testTypes = [
    { value: 'BLOOD_TEST', label: 'BLOOD_TEST' },
    { value: 'URINE_TEST', label: 'URINE_TEST' },
    { value: 'IMAGING', label: 'IMAGING' },
    { value: 'BIOPSY', label: 'BIOPSY' },
    { value: 'GENETIC', label: 'GENETIC' },
    { value: 'PATHOLOGY', label: 'PATHOLOGY' },
    { value: 'OTHER', label: 'OTHER' }
  ];

  readonly genderOptions = [
    { value: 'ALL', label: 'ALL' },
    { value: 'MALE', label: 'MALE' },
    { value: 'FEMALE', label: 'FEMALE' }
  ];

  constructor(
    private fb: FormBuilder,
    private labTestService: LabTestService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', Validators.required],
      testType: ['', Validators.required],
      laboratoryId: [null, Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      durationMinutes: [30, [Validators.required, Validators.min(1)]],
      description: [''],
      requiresFasting: [false],
      requiresAppointment: [true],
      genderSpecific: ['ALL', Validators.required]
    });
  }

  ngOnInit(): void {
    this.isEditMode = !!this.editTest;
    this.isFromRequest = !!this.selectedRequest;

    if (this.editTest) {
      this.form.patchValue({
        name: this.editTest.name,
        category: this.editTest.category,
        testType: this.editTest.testType,
        laboratoryId: this.editTest.laboratoryId,
        price: this.editTest.price,
        durationMinutes: this.editTest.durationMinutes,
        description: this.editTest.description || '',
        requiresFasting: this.editTest.requiresFasting,
        requiresAppointment: this.editTest.requiresAppointment,
        genderSpecific: this.editTest.genderSpecific
      });
    }

    if (this.selectedRequest) {
      this.form.patchValue({
        name: this.selectedRequest.testType,
        category: 'General',
        laboratoryId: this.selectedRequest.laboratoryId
      });
      // Make name and laboratoryId readonly when from request
      this.form.get('name')?.disable();
      this.form.get('laboratoryId')?.disable();
    }

    if (this.laboratoryId && !this.editTest && !this.selectedRequest) {
      this.form.patchValue({
        laboratoryId: this.laboratoryId
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const formValue = this.form.getRawValue(); // Get value including disabled fields
    const request: LabTestRequest = {
      name: formValue.name,
      category: formValue.category,
      testType: formValue.testType,
      laboratoryId: this.selectedRequest?.laboratoryId || formValue.laboratoryId,
      price: formValue.price,
      durationMinutes: formValue.durationMinutes,
      description: formValue.description,
      requiresFasting: formValue.requiresFasting,
      requiresAppointment: formValue.requiresAppointment,
      genderSpecific: formValue.genderSpecific
    };

    const operation$ = this.isEditMode
      ? this.labTestService.update(this.editTest!.id, request)
      : this.labTestService.create(request);

    operation$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.saved.emit();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.submitError = 'An error occurred. Please try again.';
        console.error('Form submission error:', err);
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  get descriptionLength(): number {
    return this.form.get('description')?.value?.length || 0;
  }
}
