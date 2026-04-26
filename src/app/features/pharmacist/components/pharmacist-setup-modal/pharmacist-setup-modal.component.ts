import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-pharmacist-setup-modal',
  template: `
    <div class="setup-modal-overlay" *ngIf="showModal">
      <div class="setup-modal-content">
        <h2>Set Up Your Pharmacy</h2>
        <p>Before you can proceed, please configure your pharmacy details.</p>
        
        <form [formGroup]="setupForm" (ngSubmit)="onSubmit()">
          
          <div class="form-group">
            <label>Pharmacy Name *</label>
            <input type="text" formControlName="pharmacy_name" placeholder="Health Plus" />
          </div>

          <div class="form-group">
            <label>Email Address *</label>
            <input type="email" formControlName="pharmacy_email" placeholder="contact@healthplus.com" />
          </div>

          <div class="form-group">
            <label>Phone Number *</label>
            <input type="text" formControlName="pharmacy_phone" />
          </div>

          <div class="form-group">
            <label>Address *</label>
            <input type="text" formControlName="pharmacy_address" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Latitude *</label>
              <input type="number" formControlName="pharmacy_latitude" />
            </div>
            <div class="form-group">
              <label>Longitude *</label>
              <input type="number" formControlName="pharmacy_longitude" />
            </div>
          </div>

          <div class="form-group">
            <label>Pièce justificative / Diplôme (Obligatoire)</label>
            <input type="file" (change)="onFileSelected($event)" accept=".pdf,image/*" required />
            <small>Your account will be on hold until an Administrator validates your file.</small>
          </div>

          <button type="submit" class="btn-pharma-primary submit-btn" [disabled]="!setupForm.valid || !selectedFile || loading">
            {{ loading ? 'Saving...' : 'Create Pharmacy' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .setup-modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.85);
      display: flex; justify-content: center; align-items: center;
      z-index: 9999;
      backdrop-filter: blur(8px);
    }
    .setup-modal-content {
      background: #1e293b;
      padding: 2rem;
      border-radius: 12px;
      width: 100%; max-width: 500px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      color: #fff;
    }
    .setup-modal-content h2 { margin-top: 0; color: #fff; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9rem; }
    .form-group input { width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: #fff; }
    .form-row { display: flex; gap: 1rem; }
    .form-row .form-group { flex: 1; }
    .submit-btn { width: 100%; padding: 1rem; font-weight: bold; background: #indigo; color: white; border: none; border-radius: 6px; cursor: pointer; }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    small { display: block; margin-top: 5px; color: #94a3b8; }
  `]
})
export class PharmacistSetupModalComponent implements OnInit {
  setupForm: FormGroup;
  showModal = false;
  selectedFile: File | null = null;
  loading = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.setupForm = this.fb.group({
      pharmacy_name: ['', Validators.required],
      pharmacy_email: ['', [Validators.required, Validators.email]],
      pharmacy_phone: ['', Validators.required],
      pharmacy_address: ['', Validators.required],
      pharmacy_latitude: [0, Validators.required],
      pharmacy_longitude: [0, Validators.required]
    });
  }

  ngOnInit() {
    if (this.authService.getUserRole() === 'PHARMACIST') {
      this.authService.pharmacistProfile$.subscribe(profile => {
        if (profile && !profile.pharmacySetupCompleted) {
          this.showModal = true;
        } else {
          this.showModal = false;
        }
      });
    }
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit() {
    if (this.setupForm.valid && this.selectedFile) {
      this.loading = true;
      const formData = new FormData();
      Object.keys(this.setupForm.value).forEach(key => {
        formData.append(key, this.setupForm.value[key]);
      });
      formData.append('diploma_document', this.selectedFile);

      this.authService.setupPharmacy(formData).subscribe({
        next: () => {
          this.loading = false;
          this.showModal = false;
        },
        error: () => {
          this.loading = false;
          alert('Failed to setup pharmacy');
        }
      });
    }
  }
}
