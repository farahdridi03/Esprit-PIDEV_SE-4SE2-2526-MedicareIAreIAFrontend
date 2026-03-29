import { Component, OnInit } from '@angular/core';
import { EmergencyService, EmergencyAlertRequest } from '../../../../../services/emergency.service';
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
    emergencyPhone?: string;
}

export interface FormErrors {
    smartDeviceId?: string;
    severity?: string;
    latitude?: string;
    longitude?: string;
    emergencyPhone?: string;
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
    currentUserFullName: string | null = null;

    // Modal state
    isModalOpen = false;
    submitting = false;
    submitError = '';
    submitSuccess = '';

    // Form model
    alertForm: EmergencyAlertRequest = {
        smartDeviceId: 0,
        severity: 'HIGH',
        latitude: 0,
        longitude: 0,
        emergencyPhone: ''
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
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.resetForm();
    }

    resetForm(): void {
        this.alertForm = {
            smartDeviceId: 0,
            severity: 'HIGH',
            latitude: 0,
            longitude: 0,
            emergencyPhone: ''
        };
        this.formErrors = {};
        this.formTouched = {};
        this.submitError = '';
        this.submitSuccess = '';
        this.submitting = false;
    }

    // ── VALIDATION ─────────────────────────────────────────

    markTouched(field: string): void {
        this.formTouched[field] = true;
        this.validateField(field);
    }

    validateField(field: string): void {
        switch (field) {
            case 'smartDeviceId':
                if (!this.alertForm.smartDeviceId || this.alertForm.smartDeviceId <= 0) {
                    this.formErrors.smartDeviceId = 'L\'ID du dispositif est requis et doit être supérieur à 0.';
                } else if (!Number.isInteger(Number(this.alertForm.smartDeviceId))) {
                    this.formErrors.smartDeviceId = 'L\'ID du dispositif doit être un nombre entier.';
                } else {
                    delete this.formErrors.smartDeviceId;
                }
                break;

            case 'severity':
                if (!this.alertForm.severity) {
                    this.formErrors.severity = 'La sévérité est requise.';
                } else if (!this.severities.includes(this.alertForm.severity)) {
                    this.formErrors.severity = 'Sévérité invalide. Choisissez parmi: LOW, MEDIUM, HIGH, CRITICAL.';
                } else {
                    delete this.formErrors.severity;
                }
                break;

            case 'latitude':
                const lat = Number(this.alertForm.latitude);
                if (this.alertForm.latitude === null || this.alertForm.latitude === undefined || this.alertForm.latitude.toString() === '') {
                    this.formErrors.latitude = 'La latitude est requise.';
                } else if (isNaN(lat)) {
                    this.formErrors.latitude = 'La latitude doit être un nombre valide.';
                } else if (lat < -90 || lat > 90) {
                    this.formErrors.latitude = 'La latitude doit être entre -90 et 90.';
                } else {
                    delete this.formErrors.latitude;
                }
                break;

            case 'longitude':
                const lng = Number(this.alertForm.longitude);
                if (this.alertForm.longitude === null || this.alertForm.longitude === undefined || this.alertForm.longitude.toString() === '') {
                    this.formErrors.longitude = 'La longitude est requise.';
                } else if (isNaN(lng)) {
                    this.formErrors.longitude = 'La longitude doit être un nombre valide.';
                } else if (lng < -180 || lng > 180) {
                    this.formErrors.longitude = 'La longitude doit être entre -180 et 180.';
                } else {
                    delete this.formErrors.longitude;
                }
                break;

            case 'emergencyPhone':
                const phone = this.alertForm.emergencyPhone?.trim() || '';
                if (phone && !/^[+]?[\d\s\-()]{8,20}$/.test(phone)) {
                    this.formErrors.emergencyPhone = 'Numéro de téléphone invalide (8-20 chiffres, +, - et espaces autorisés).';
                } else {
                    delete this.formErrors.emergencyPhone;
                }
                break;
        }
    }

    validateAll(): boolean {
        // Mark all fields as touched
        ['smartDeviceId', 'severity', 'latitude', 'longitude', 'emergencyPhone'].forEach(f => {
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
        // Quick check without mutating touched state
        const f = this.alertForm;
        if (!f.smartDeviceId || f.smartDeviceId <= 0) return false;
        if (!f.severity || !this.severities.includes(f.severity)) return false;
        const lat = Number(f.latitude);
        if (isNaN(lat) || lat < -90 || lat > 90) return false;
        const lng = Number(f.longitude);
        if (isNaN(lng) || lng < -180 || lng > 180) return false;
        if (f.emergencyPhone?.trim() && !/^[+]?[\d\s\-()]{8,20}$/.test(f.emergencyPhone.trim())) return false;
        return true;
    }

    // ── GEOLOCATION ────────────────────────────────────────

    detectingLocation = false;

    useCurrentLocation(): void {
        if (!navigator.geolocation) {
            this.submitError = 'La géolocalisation n\'est pas supportée par votre navigateur.';
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

        if (!this.validateAll()) {
            this.submitError = 'Please correct the errors in the form before submitting.';
            return;
        }

        this.submitting = true;

        const payload: EmergencyAlertRequest = {
            smartDeviceId: Number(this.alertForm.smartDeviceId),
            severity: this.alertForm.severity,
            latitude: Number(this.alertForm.latitude),
            longitude: Number(this.alertForm.longitude),
            emergencyPhone: this.alertForm.emergencyPhone?.trim() || undefined
        };

        this.emergencyService.createAlert(payload).subscribe({
            next: () => {
                this.submitting = false;
                this.submitSuccess = 'Emergency alert created successfully!';
                setTimeout(() => {
                    this.closeModal();
                    this.loadAlerts();
                }, 1200);
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
            case 'CRITICAL': return '🚨 Critique';
            case 'HIGH': return '⚠️ Élevée';
            case 'MEDIUM': return '🔔 Moyenne';
            case 'LOW': return '💡 Faible';
            default: return severity;
        }
    }
}
