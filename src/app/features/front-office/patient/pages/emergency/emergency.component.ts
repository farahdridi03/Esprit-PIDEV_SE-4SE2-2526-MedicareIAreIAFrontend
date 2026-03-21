import { Component, OnInit } from '@angular/core';
import { EmergencyService } from '../../../../../services/emergency.service';

export interface EmergencyAlert {
    id: number;
    smartDeviceId: number;
    patientName?: string | null;
    severity: string;
    status: string;
    latitude: number;
    longitude: number;
    canceledByPatient: boolean;
    createdAt: string;
}

@Component({
    selector: 'app-emergency',
    templateUrl: './emergency.component.html',
    styleUrls: ['./emergency.component.scss']
})
export class EmergencyComponent implements OnInit {
    alerts: EmergencyAlert[] = [];
    loading = false;
    cancelingId: number | null = null;

    constructor(private emergencyService: EmergencyService) { }

    ngOnInit(): void {
        this.loadAlerts();
    }

    loadAlerts(): void {
        this.loading = true;
        this.emergencyService.getAllAlerts().subscribe({
            next: (data: EmergencyAlert[]) => {
                this.alerts = data;
                this.loading = false;
            },
            error: (err: any) => {
                console.error('Error loading alerts', err);
                this.loading = false;
            }
        });
    }

    cancelAlert(id: number): void {
        if (!confirm('Cancel this emergency alert?')) return;
        this.cancelingId = id;
        this.emergencyService.cancelAlert(id).subscribe({
            next: () => {
                this.cancelingId = null;
                this.loadAlerts();
            },
            error: (err: any) => {
                console.error('Error canceling alert', err);
                this.cancelingId = null;
            }
        });
    }

    getSeverityClass(severity: string): string {
        switch (severity?.toUpperCase()) {
            case 'HIGH': return 'severity-high';
            case 'MEDIUM': return 'severity-medium';
            case 'LOW': return 'severity-low';
            default: return '';
        }
    }

    getStatusClass(status: string): string {
        switch (status?.toUpperCase()) {
            case 'PENDING': return 'status-pending';
            case 'CLINIC_NOTIFIED': return 'status-notified';
            case 'RESOLVED': return 'status-resolved';
            default: return '';
        }
    }
}
