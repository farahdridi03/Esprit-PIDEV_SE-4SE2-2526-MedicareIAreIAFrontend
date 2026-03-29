import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Donation, DonationStatus, DonationType, AidRequest, AidRequestStatus } from '../../../../models/donation.model';
import { DonationService } from '../../../../services/donation.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
    selector: 'app-donations-management',
    templateUrl: './donations-management.component.html',
    styleUrls: ['./donations-management.component.scss']
})
export class DonationsManagementComponent implements OnInit {
    donations: Donation[] = [];
    aidRequests: AidRequest[] = [];

    loading = false;
    currentTab: 'DONATIONS' | 'REQUESTS' = 'DONATIONS';

    filterStatus: string = 'ALL';
    reqFilterStatus: string = 'ALL';
    DonationType = DonationType;
    DonationStatus = DonationStatus;
    AidRequestStatus = AidRequestStatus;

    showAssignModal = false;
    showDocModal = false;
    selectedReq: AidRequest | null = null;
    availableDonations: Donation[] = [];
    selectedDonationId: number | null = null;
    previewDocUrl: SafeResourceUrl | null = null;
    rawPreviewDoc: string | null = null;

    constructor(
        private donationService: DonationService,
        private notificationService: NotificationService,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit(): void {
        this.refresh();
    }

    refresh(): void {
        this.loading = true;
        this.donationService.getAllDonations().subscribe({
            next: (data) => {
                this.donations = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error fetching donations', err);
                this.loading = false;
            }
        });
        this.refreshRequests();
    }

    refreshRequests(): void {
        this.donationService.getAllAidRequests().subscribe({
            next: (data) => {
                console.log('Aid requests from backend:', data);
                this.aidRequests = data;
            },
            error: (err) => {
                console.error('❌ Error fetching aid requests:', err);
            }
        });
    }

    switchTab(tab: 'DONATIONS' | 'REQUESTS'): void {
        this.currentTab = tab;
    }

    get filteredDonations(): Donation[] {
        if (this.filterStatus === 'ALL') return this.donations;
        return this.donations.filter(d => d.status === this.filterStatus);
    }

    updateStatus(donation: Donation, newStatus: DonationStatus): void {
        const payload = { ...donation, status: newStatus };
        this.donationService.updateDonation(donation.id!, payload).subscribe({
            next: () => this.refresh(),
            error: (err) => console.error('Error updating donation', err)
        });
    }

    deleteDonation(id: number | undefined): void {
        if (!id) return;
        if (confirm('Are you sure you want to delete this donation permanently?')) {
            this.donationService.deleteDonation(id).subscribe({
                next: () => this.refresh(),
                error: (err) => console.error('Error deleting donation', err)
            });
        }
    }

    get filteredRequests(): AidRequest[] {
        if (this.reqFilterStatus === 'ALL') return this.aidRequests;
        return this.aidRequests.filter(req => req.status === this.reqFilterStatus);
    }

    updateReqStatus(req: AidRequest, newStatus: AidRequestStatus): void {
        if (!req.id) return;
        this.donationService.updateAidRequestStatus(req.id, newStatus).subscribe({
            next: () => this.refresh(),
            error: (err) => console.error('Error updating request status', err)
        });
    }

    openAssignModal(req: AidRequest): void {
        this.selectedReq = req;
        this.selectedDonationId = null;
        this.availableDonations = this.donations.filter(d => d.status === DonationStatus.AVAILABLE);
        this.showAssignModal = true;
    }

    closeAssignModal(): void {
        this.showAssignModal = false;
        this.selectedReq = null;
        this.selectedDonationId = null;
    }

    confirmAssignment(): void {
        if (!this.selectedReq?.id || !this.selectedDonationId) return;
        this.loading = true;
        this.donationService.assignDonation({
            donationId: this.selectedDonationId,
            aidRequestId: this.selectedReq.id
        }).subscribe({
            next: () => {
                // 🔔 Notify Patient
                if (this.selectedReq && this.selectedReq.patientId) {
                    this.notificationService.addPatientNotification(
                        this.selectedReq.patientId,
                        'Request Approved 🎉',
                        `Good news! A donation has been assigned to your aid request (Req #${this.selectedReq.id}).`,
                        'info'
                    );
                }
                
                this.closeAssignModal();
                this.refresh();
            },
            error: (err) => {
                console.error('Error assigning donation', err);
                this.loading = false;
            }
        });
    }

    getInitials(name: string | undefined): string {
        if (!name) return 'UN';
        return name.substring(0, 2).toUpperCase();
    }

    downloadOrViewDoc(base64: string | undefined): void {
        if (!base64) return;
        if (base64.startsWith('http')) {
            window.open(base64, '_blank');
            return;
        }
        
        // Try to guess extension
        let ext = 'txt';
        if (base64.includes('application/pdf')) ext = 'pdf';
        else if (base64.includes('image/png')) ext = 'png';
        else if (base64.includes('image/jpeg')) ext = 'jpg';
        
        const a = document.createElement('a');
        a.href = base64;
        a.download = `supporting-document.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    openDocModal(base64: string | undefined): void {
        if (!base64) return;
        this.rawPreviewDoc = base64;
        this.previewDocUrl = this.sanitizer.bypassSecurityTrustResourceUrl(base64);
        this.showDocModal = true;
    }

    closeDocModal(): void {
        this.showDocModal = false;
        this.previewDocUrl = null;
        this.rawPreviewDoc = null;
    }

    isPdf(base64: any): boolean {
        if (!base64 || typeof base64 !== 'string') return false;
        return base64.includes('application/pdf');
    }
}
