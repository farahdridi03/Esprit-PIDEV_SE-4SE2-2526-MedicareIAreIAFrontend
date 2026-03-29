import { Component, OnInit } from '@angular/core';
import { AmbulanceService, AmbulanceResponse, AmbulanceRequest } from '../../../../../services/ambulance.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-clinic-ambulances',
  templateUrl: './clinic-ambulances.component.html',
  styleUrls: ['./clinic-ambulances.component.scss']
})
export class ClinicAmbulancesComponent implements OnInit {
  ambulances: AmbulanceResponse[] = [];
  loading = true;
  error = '';
  showForm = false;
  editingId: number | null = null;
  submitting = false;
  deletingId: number | null = null;

  form: AmbulanceRequest = {
    clinicId: null,
    licensePlate: '',
    currentLat: 0,
    currentLng: 0,
    status: 'AVAILABLE'
  };

  constructor(
    private ambulanceService: AmbulanceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadAmbulances();
  }

  get ambulancesWithGpsCount(): number {
    return this.ambulances.filter(a => a.currentLat && a.currentLng).length;
  }

  loadAmbulances() {
    this.loading = true;
    const clinicId = this.authService.getUserId();
    if (!clinicId) {
      this.error = 'Unable to identify clinic.';
      this.loading = false;
      return;
    }

    this.ambulanceService.getByClinic(clinicId).subscribe({
      next: (data) => {
        this.ambulances = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Unable to load ambulances.';
        this.loading = false;
      }
    });
  }

  openAddForm() {
    this.editingId = null;
    this.form = { 
      clinicId: this.authService.getUserId(), 
      licensePlate: '', 
      currentLat: 0, 
      currentLng: 0, 
      status: 'AVAILABLE' 
    };
    this.showForm = true;
  }

  openEditForm(ambulance: AmbulanceResponse) {
    this.editingId = ambulance.id;
    this.form = {
      clinicId: ambulance.clinicId,
      licensePlate: ambulance.licensePlate,
      currentLat: ambulance.currentLat || 0,
      currentLng: ambulance.currentLng || 0,
      status: ambulance.status || 'AVAILABLE'
    };
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingId = null;
  }

  submitForm() {
    if (!this.form.licensePlate) return;
    
    // Ensure clinicId is set if missing (safety check)
    if (!this.form.clinicId) {
        this.form.clinicId = this.authService.getUserId();
    }

    this.submitting = true;

    const obs = this.editingId !== null
      ? this.ambulanceService.update(this.editingId, this.form)
      : this.ambulanceService.create(this.form);

    obs.subscribe({
      next: (result) => {
        if (this.editingId !== null) {
          const idx = this.ambulances.findIndex(a => a.id === this.editingId);
          if (idx !== -1) this.ambulances[idx] = result;
        } else {
          this.ambulances.unshift(result);
        }
        this.submitting = false;
        this.showForm = false;
        this.editingId = null;
        this.error = '';
      },
      error: (err) => {
        console.error(err);
        this.submitting = false;
        if (err.error && err.error.details) {
          // Flatten the details map into a string
          const details = Object.entries(err.error.details)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(' | ');
          this.error = `Validation error: ${details}`;
        } else {
          this.error = 'Error during ambulance registration.';
        }
      }
    });
  }

  delete(id: number) {
    if (!confirm('Delete this ambulance?')) return;
    this.deletingId = id;
    this.ambulanceService.delete(id).subscribe({
      next: () => {
        this.ambulances = this.ambulances.filter(a => a.id !== id);
        this.deletingId = null;
      },
      error: () => { 
        this.deletingId = null; 
        this.error = 'Error during deletion.';
      }
    });
  }
}

