import { Component, OnInit } from '@angular/core';
import { EmergencyService, EmergencyAlertResponse } from '../../../../services/emergency.service';

@Component({
  selector: 'app-emergency-management',
  templateUrl: './emergency-management.component.html',
  styleUrls: ['./emergency-management.component.scss']
})
export class EmergencyManagementComponent implements OnInit {
  alerts: EmergencyAlertResponse[] = [];
  filteredAlerts: EmergencyAlertResponse[] = [];
  loading = false;
  error = '';
  selectedStatus = 'ALL';
  statuses = ['ALL', 'PENDING', 'ACKNOWLEDGED', 'CLINIC_NOTIFIED', 'RESOLVED', 'CANCELED'];
  updatingId: number | null = null;

  constructor(private emergencyService: EmergencyService) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.loading = true;
    this.error = '';
    this.emergencyService.getAllAlerts().subscribe({
      next: (data) => {
        this.alerts = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load emergency alerts. Please check if the backend is running.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onFilterChange(status: string): void {
    this.selectedStatus = status;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedStatus === 'ALL') {
      this.filteredAlerts = [...this.alerts];
    } else {
      this.filteredAlerts = this.alerts.filter(a => a.status === this.selectedStatus);
    }
  }

  updateStatus(alert: EmergencyAlertResponse, newStatus: string): void {
    this.updatingId = alert.id;
    this.emergencyService.updateAlertStatus(alert.id, newStatus).subscribe({
      next: (updated) => {
        const index = this.alerts.findIndex(a => a.id === updated.id);
        if (index !== -1) {
          this.alerts[index] = updated;
          this.applyFilter();
        }
        this.updatingId = null;
      },
      error: (err) => {
        console.error(err);
        this.updatingId = null;
      }
    });
  }

  getSeverityClass(severity: string): string {
    return (severity || 'LOW').toLowerCase();
  }

  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return '🔥';
      case 'HIGH': return '⚡';
      case 'MEDIUM': return '⚠️';
      default: return 'ℹ️';
    }
  }

  getStatusClass(status: string): string {
    return (status || 'PENDING').toLowerCase().replace('_', '-');
  }

  formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  }
}
