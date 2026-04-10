import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { VaccineEntry } from '../../models/baby-care.models';
import { VaccineService } from '../../services/vaccine.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-bc-vaccine',
  templateUrl: './vaccine.component.html',
  styleUrls: ['./vaccine.component.scss']
})
export class VaccineComponent {

  vaccines$: Observable<VaccineEntry[]>;

  showAddForm = false;
  addForm!: FormGroup;

  deleteTargetId: string | null = null;
  showConfirm = false;

  constructor(
    public vaccineSvc: VaccineService,
    private toastSvc: ToastService,
    private fb: FormBuilder,
  ) {
    this.vaccines$ = this.vaccineSvc.vaccines$;
    this._buildForm();
  }

  get progress() { return this.vaccineSvc.progress; }
  get nextDue() { return this.vaccineSvc.nextDue; }

  toggleStatus(v: VaccineEntry): void {
    if (v.status === 'done') {
      this.vaccineSvc.markUndone(v.id, v.scheduledAgeWeeks);
      this.toastSvc.show('Marked as pending', 'warning');
    } else {
      this.vaccineSvc.markDone(v.id);
      this.toastSvc.show('Vaccine completed ✨');
    }
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) this._buildForm();
  }

  submitAdd(): void {
    if (this.addForm.invalid) return;
    const { name, scheduledAgeWeeks, description } = this.addForm.value;
    this.vaccineSvc.addCustom(name, +scheduledAgeWeeks, description || undefined);
    this.toastSvc.show('Custom vaccine added 💉');
    this.showAddForm = false;
    this._buildForm();
  }

  confirmDelete(id: string): void { this.deleteTargetId = id; this.showConfirm = true; }

  executeDelete(): void {
    if (this.deleteTargetId) {
      this.vaccineSvc.delete(this.deleteTargetId);
      this.toastSvc.show('Vaccine removed', 'warning');
    }
    this.showConfirm = false; this.deleteTargetId = null;
  }

  cancelDelete(): void { this.showConfirm = false; this.deleteTargetId = null; }

  formatDate(iso?: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString();
  }

  private _buildForm(): void {
    this.addForm = this.fb.group({
      name: ['', Validators.required],
      scheduledAgeWeeks: [0, [Validators.required, Validators.min(0)]],
      description: [''],
    });
  }
}
