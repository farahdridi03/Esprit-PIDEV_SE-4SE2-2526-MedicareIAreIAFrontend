import { Component, OnInit, OnDestroy } from '@angular/core';
import { EmergencyService, EmergencyAlertRequest, SmartDeviceResponse } from '../../../../../services/emergency.service';
import { AuthService } from '../../../../../services/auth.service';

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

export interface FormErrors {
    severity?: string;
    latitude?: string;
    longitude?: string;
}

@Component({
    selector: 'app-emergency',
    templateUrl: './emergency.component.html',
    styleUrls: ['./emergency.component.scss']
})
export class EmergencyComponent implements OnInit, OnDestroy {
    alerts: EmergencyAlert[] = [];
    loading = false;
    cancelingId: number | null = null;
    currentUserFullName: string | null = null;

    private refreshTimer: ReturnType<typeof setInterval> | null = null;

    // Smart device (auto-fetched)
    deviceInfo: SmartDeviceResponse | null = null;
    deviceLoading = false;
    deviceError = '';

    // Modal state
    isModalOpen = false;
    submitting = false;
    submitError = '';
    submitSuccess = '';

    // Form model (no smartDeviceId or emergencyPhone — both come from profile)
    alertForm: Omit<EmergencyAlertRequest, 'smartDeviceId' | 'emergencyPhone'> = {
        severity: 'HIGH',
        latitude: 0,
        longitude: 0
    };

    // Validation
    formErrors: FormErrors = {};
    formTouched: { [key: string]: boolean } = {};
    severities: Array<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    constructor(
        private emergencyService: EmergencyService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.currentUserFullName = this.authService.getUserFullName();
        this.loadAlerts();
        this.refreshTimer = setInterval(() => this.loadAlerts(), 30_000);
    }

    ngOnDestroy(): void {
        if (this.refreshTimer) clearInterval(this.refreshTimer);
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

    // ── MODAL ──────────────────────────────────────────────

    openModal(): void {
        this.resetForm();
        this.isModalOpen = true;
        this.fetchSmartDevice();
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.resetForm();
    }

    resetForm(): void {
        this.alertForm = {
            severity: 'HIGH',
            latitude: 0,
            longitude: 0
        };
        this.formErrors = {};
        this.formTouched = {};
        this.submitError = '';
        this.submitSuccess = '';
        this.submitting = false;
        this.deviceError = '';
    }

    // ── DEVICE AUTO-FETCH ──────────────────────────────────

    private fetchSmartDevice(): void {
        const patientId = this.authService.getUserId();
        if (!patientId) {
            this.deviceError = 'Unable to identify your account. Please log in again.';
            return;
        }
        this.deviceLoading = true;
        this.deviceInfo = null;
        this.deviceError = '';
        this.emergencyService.getSmartDeviceByPatientId(patientId).subscribe({
            next: (device) => {
                this.deviceInfo = device;
                this.deviceLoading = false;
            },
            error: (err: any) => {
                console.error('Error fetching smart device', err);
                this.deviceError = err.status === 404
                    ? 'No smart device linked to your profile. Please contact your clinic.'
                    : 'Unable to load smart device information.';
                this.deviceLoading = false;
            }
        });
    }

    // ── VALIDATION ─────────────────────────────────────────

    markTouched(field: string): void {
        this.formTouched[field] = true;
        this.validateField(field);
    }

    validateField(field: string): void {
        switch (field) {
            case 'severity':
                if (!this.alertForm.severity) {
                    this.formErrors.severity = 'Severity is required.';
                } else if (!this.severities.includes(this.alertForm.severity as any)) {
                    this.formErrors.severity = 'Invalid severity. Choose from: LOW, MEDIUM, HIGH, CRITICAL.';
                } else {
                    delete this.formErrors.severity;
                }
                break;

            case 'latitude':
                const lat = Number(this.alertForm.latitude);
                if (this.alertForm.latitude === null || this.alertForm.latitude === undefined) {
                    this.formErrors.latitude = 'Latitude is required.';
                } else if (isNaN(lat)) {
                    this.formErrors.latitude = 'Latitude must be a valid number.';
                } else if (lat < -90 || lat > 90) {
                    this.formErrors.latitude = 'Latitude must be between -90 and 90.';
                } else {
                    delete this.formErrors.latitude;
                }
                break;

            case 'longitude':
                const lng = Number(this.alertForm.longitude);
                if (this.alertForm.longitude === null || this.alertForm.longitude === undefined) {
                    this.formErrors.longitude = 'Longitude is required.';
                } else if (isNaN(lng)) {
                    this.formErrors.longitude = 'Longitude must be a valid number.';
                } else if (lng < -180 || lng > 180) {
                    this.formErrors.longitude = 'Longitude must be between -180 and 180.';
                } else {
                    delete this.formErrors.longitude;
                }
                break;
        }
    }

    validateAll(): boolean {
        ['severity', 'latitude', 'longitude'].forEach(f => {
            this.formTouched[f] = true;
            this.validateField(f);
        });
        return Object.keys(this.formErrors).length === 0;
    }

    hasError(field: string): boolean {
        return !!(this.formTouched[field] && this.formErrors[field as keyof FormErrors]);
    }

    getError(field: string): string {
        return this.formErrors[field as keyof FormErrors] || '';
    }

    get isFormValid(): boolean {
        if (!this.deviceInfo) return false;
        const f = this.alertForm;
        if (!f.severity || !this.severities.includes(f.severity as any)) return false;
        const lat = Number(f.latitude);
        if (isNaN(lat) || lat < -90 || lat > 90) return false;
        const lng = Number(f.longitude);
        if (isNaN(lng) || lng < -180 || lng > 180) return false;
        return true;
    }

    // ── GEOLOCATION ────────────────────────────────────────

    detectingLocation = false;

    useCurrentLocation(): void {
        if (!navigator.geolocation) {
            this.submitError = 'Geolocation is not supported by your browser.';
            return;
        }
        this.detectingLocation = true;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                this.alertForm.latitude = parseFloat(pos.coords.latitude.toFixed(6));
                this.alertForm.longitude = parseFloat(pos.coords.longitude.toFixed(6));
                this.detectingLocation = false;
                this.markTouched('latitude');
                this.markTouched('longitude');
            },
            (err) => {
                console.error('Geolocation error', err);
                this.submitError = 'Unable to detect location. Please enter coordinates manually.';
                this.detectingLocation = false;
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    // ── SUBMIT ─────────────────────────────────────────────

    submitAlert(): void {
        this.submitError = '';
        this.submitSuccess = '';

        if (!this.deviceInfo) {
            this.submitError = 'Smart device not loaded. Please wait or refresh.';
            return;
        }

        if (!this.validateAll()) {
            this.submitError = 'Please correct the errors in the form before submitting.';
            return;
        }

        this.submitting = true;

        const payload: EmergencyAlertRequest = {
            smartDeviceId: this.deviceInfo.id,
            severity: this.alertForm.severity as any,
            latitude: Number(this.alertForm.latitude),
            longitude: Number(this.alertForm.longitude)
        };

        this.emergencyService.createAlert(payload).subscribe({
            next: () => {
                this.submitting = false;
                this.submitSuccess = 'Emergency alert created successfully!';
                setTimeout(() => {
                    this.closeModal();
                    this.loadAlerts();
                }, 2000);
            },
            error: (err: any) => {
                this.submitting = false;
                console.error('Error creating alert', err);
                if (err.error && err.error.details) {
                    const details = Object.entries(err.error.details)
                        .map(([field, msg]) => `${field}: ${msg}`)
                        .join(' | ');
                    this.submitError = `Validation error: ${details}`;
                } else if (err.status === 400 && err.error?.message) {
                    this.submitError = err.error.message;
                } else {
                    this.submitError = 'Error creating the alert. Please try again.';
                }
            }
        });
    }

    // ── CANCEL ─────────────────────────────────────────────

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

    // ── HELPERS ─────────────────────────────────────────────

    isCreator(alertPatientName: string | null | undefined): boolean {
        if (!alertPatientName || !this.currentUserFullName) return false;
        return alertPatientName.trim().toLowerCase() === this.currentUserFullName.trim().toLowerCase();
    }

    getSeverityClass(severity: string): string {
        switch (severity?.toUpperCase()) {
            case 'CRITICAL': return 'severity-critical';
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
            case 'ACKNOWLEDGED': return 'status-acknowledged';
            case 'RESOLVED': return 'status-resolved';
            case 'CANCELED': return 'status-canceled';
            default: return '';
        }
    }

    getSeverityIcon(severity: string): string {
        switch (severity?.toUpperCase()) {
            case 'CRITICAL': return '🚨';
            case 'HIGH': return '⚠️';
            case 'MEDIUM': return '🔔';
            default: return '💡';
        }
    }

    getSeverityLabel(severity: string): string {
        switch (severity) {
            case 'CRITICAL': return '🚨 Critical';
            case 'HIGH': return '⚠️ High';
            case 'MEDIUM': return '🔔 Medium';
            case 'LOW': return '💡 Low';
            default: return severity;
        }
    }
}
