import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LaboratoryService } from '../../../../services/laboratory.service';

@Component({
  selector: 'app-laboratory-form',
  templateUrl: './laboratory-form.component.html',
  styleUrls: ['./laboratory-form.component.scss']
})
export class LaboratoryFormComponent implements OnInit {
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
        this.form.patchValue({
          name: lab.name,
          address: lab.address,
          phone: lab.phone,
          email: lab.email,
          openingHours: lab.openingHours,
          specializations: lab.specializations,
          isActive: lab.isActive
        });
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
    const { isActive, ...rest } = this.form.value;
    const payload = { ...rest };

    if (this.isEditMode && this.labId !== null) {
      this.labService.update(this.labId, payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.showSnackbar('Laboratory updated successfully!', 'success');
          setTimeout(() => this.router.navigate(['/admin/laboratories']), 1200);
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
          this.showSnackbar('Laboratory registered successfully!', 'success');
          setTimeout(() => this.router.navigate(['/admin/laboratories']), 1200);
        },
        error: (err) => {
          this.isSaving = false;
          this.showSnackbar(err?.error?.message || 'Failed to create laboratory.', 'error');
        }
      });
    }
  }

  discard(): void {
    this.router.navigate(['/admin/laboratories']);
  }

  showSnackbar(msg: string, type: 'success' | 'error'): void {
    this.snackbarMsg = msg;
    this.snackbarType = type;
    this.snackbarVisible = true;
    setTimeout(() => this.snackbarVisible = false, 3000);
  }
}
