import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LaboratoryService } from '../../../../../services/laboratory.service';
import { LaboratoryRequest } from '../../../../../models/laboratory.model';

@Component({
  selector: 'app-lab-management-form',
  templateUrl: './lab-management-form.component.html',
  styleUrls: ['./lab-management-form.component.scss']
})
export class LabManagementFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  labId: number | null = null;
  isLoading = false;
  isSaving = false;

  snackbarMsg = '';
  snackbarType: 'success' | 'error' = 'success';
  snackbarVisible = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private labService: LaboratoryService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      email: ['', [Validators.required, Validators.email]],
      openingHours: ['', Validators.required],
      specializations: [''],
      isActive: [true]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.labId = +idParam;
      this.loadLab(this.labId);
    }
  }

  loadLab(id: number): void {
    this.isLoading = true;
    this.labService.getById(id).subscribe({
      next: (lab) => {
        this.form.patchValue(lab);
        this.isLoading = false;
      },
      error: () => {
        this.showSnackbar('Failed to load laboratory.', 'error');
        this.isLoading = false;
      }
    });
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    // ✅ isActive inclus dans le payload
    const payload: LaboratoryRequest = {
      name: this.form.value.name,
      address: this.form.value.address,
      phone: this.form.value.phone,
      email: this.form.value.email,
      openingHours: this.form.value.openingHours,
      specializations: this.form.value.specializations || '',
      isActive: this.form.value.isActive
    };

    if (this.isEditMode && this.labId !== null) {
      this.labService.update(this.labId, payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.showSnackbar('Laboratory updated!', 'success');
          setTimeout(() => this.router.navigate(['/front/laboratorystaff/laboratories']), 1200);
        },
        error: (err) => {
          this.isSaving = false;
          this.showSnackbar(err?.error?.message || 'Update failed.', 'error');
        }
      });
    } else {
      this.labService.create(payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.showSnackbar('Laboratory registered!', 'success');
          setTimeout(() => this.router.navigate(['/front/laboratorystaff/laboratories']), 1200);
        },
        error: (err) => {
          this.isSaving = false;
          this.showSnackbar(err?.error?.message || 'Failed to create.', 'error');
        }
      });
    }
  }

  discard(): void {
    this.router.navigate(['/front/laboratorystaff/laboratories']);
  }

  showSnackbar(msg: string, type: 'success' | 'error'): void {
    this.snackbarMsg = msg;
    this.snackbarType = type;
    this.snackbarVisible = true;
    setTimeout(() => this.snackbarVisible = false, 3000);
  }
}