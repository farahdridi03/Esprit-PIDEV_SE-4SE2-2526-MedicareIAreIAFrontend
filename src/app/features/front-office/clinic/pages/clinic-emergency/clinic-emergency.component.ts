import { Component, OnInit } from '@angular/core';
import { EmergencyService, EmergencyAlertResponse } from '../../../../../services/emergency.service';
import { AmbulanceService, AmbulanceResponse } from '../../../../../services/ambulance.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-clinic-emergency',
  templateUrl: './clinic-emergency.component.html',
  styleUrls: ['./clinic-emergency.component.scss']
})
export class ClinicEmergencyComponent implements OnInit {
  alerts: EmergencyAlertResponse[] = [];
  filteredAlerts: EmergencyAlertResponse[] = [];
  ambulances: AmbulanceResponse[] = [];
  loading = true;
  error = '';
  selectedStatus = 'ALL';
  updatingId: number | null = null;
  dispatchingAlertId: number | null = null;
  selectedAmbulanceId: number | null = null;

  statuses = ['ALL', 'PENDING', 'ACKNOWLEDGED', 'CLINIC_NOTIFIED', 'RESOLVED', 'CANCELED'];

  constructor(
    private emergencyService: EmergencyService,
    private ambulanceService: AmbulanceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadAlerts();
    this.loadClinicAmbulances();
  }

  loadAlerts() {
    this.loading = true;
    this.emergencyService.getAllAlerts().subscribe({
      next: (data) => {
        // En mode démo on trie par date
        this.alerts = data.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Unable to load emergency alerts.';
        this.loading = false;
      }
    });
  }

  loadClinicAmbulances() {
    const clinicId = this.authService.getUserId();
    if (clinicId) {
      this.ambulanceService.getByClinic(clinicId).subscribe({
        next: (data) => {
          this.ambulances = data.filter(a => a.status === 'AVAILABLE');
        },
        error: (err) => console.error('Error loading ambulances', err)
      });
    }
  }

  applyFilter() {
    if (this.selectedStatus === 'ALL') {
      this.filteredAlerts = [...this.alerts];
    } else {
      this.filteredAlerts = this.alerts.filter(a => a.status === this.selectedStatus);
    }
  }

  onFilterChange(status: string) {
    this.selectedStatus = status;
    this.applyFilter();
  }

  acknowledge(alert: EmergencyAlertResponse) {
    this.updatingId = alert.id;
    this.emergencyService.updateAlertStatus(alert.id, 'ACKNOWLEDGED').subscribe({
      next: (updated) => {
        const idx = this.alerts.findIndex(a => a.id === updated.id);
        if (idx !== -1) this.alerts[idx] = updated;
        this.applyFilter();
        this.updatingId = null;
      },
      error: () => { this.updatingId = null; }
    });
  }

  openDispatchModal(alertId: number) {
    this.dispatchingAlertId = alertId;
    this.selectedAmbulanceId = this.ambulances.length > 0 ? this.ambulances[0].id : null;
  }

  cancelDispatch() {
    this.dispatchingAlertId = null;
    this.selectedAmbulanceId = null;
  }

  confirmDispatch() {
    if (!this.dispatchingAlertId || !this.selectedAmbulanceId) return;

    const clinicId = this.authService.getUserId();
    if (!clinicId) return;

    this.updatingId = this.dispatchingAlertId;
    this.emergencyService.dispatchIntervention({
      emergencyAlertId: this.dispatchingAlertId,
      clinicId: clinicId,
      ambulanceId: this.selectedAmbulanceId
    }).subscribe({
      next: () => {
        // Recharger les alertes pour voir le nouveau statut
        this.loadAlerts();
        // Mettre à jour la disponibilité locale de l'ambulance
        this.ambulances = this.ambulances.filter(a => a.id !== this.selectedAmbulanceId);
        this.dispatchingAlertId = null;
        this.selectedAmbulanceId = null;
        this.updatingId = null;
      },
      error: (err) => {
        console.error(err);
        this.updatingId = null;
        this.error = 'Dispatch failed.';
      }
    });
  }

  resolve(alert: EmergencyAlertResponse) {
    this.updatingId = alert.id;
    this.emergencyService.updateAlertStatus(alert.id, 'RESOLVED').subscribe({
      next: (updated) => {
        const idx = this.alerts.findIndex(a => a.id === updated.id);
        if (idx !== -1) this.alerts[idx] = updated;
        this.applyFilter();
        this.updatingId = null;
      },
      error: () => { this.updatingId = null; }
    });
  }

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'severity-critical';
      case 'HIGH': return 'severity-high';
      case 'MEDIUM': return 'severity-medium';
      default: return 'severity-low';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'ACKNOWLEDGED': return 'status-acknowledged';
      case 'CLINIC_NOTIFIED': return 'status-dispatching';
      case 'RESOLVED': return 'status-resolved';
      case 'CANCELED': return 'status-canceled';
      default: return '';
    }
  }

  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return '🚨';
      case 'HIGH': return '⚠️';
      case 'MEDIUM': return '🔔';
      default: return '💡';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  get pendingCount(): number {
    return this.alerts.filter(a => a.status === 'PENDING').length;
  }

  get criticalCount(): number {
    return this.alerts.filter(a => a.severity === 'CRITICAL').length;
  }
}
