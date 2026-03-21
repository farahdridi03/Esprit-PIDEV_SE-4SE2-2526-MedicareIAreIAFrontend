import { Component, OnInit } from '@angular/core';
import { Donation, DonationStatus, DonationType, AidRequest, AidRequestStatus } from '../../../../models/donation.model';
import { DonationService } from '../../../../services/donation.service';

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
    selectedReq: AidRequest | null = null;
    availableDonations: Donation[] = [];
    selectedDonationId: number | null = null;

    constructor(private donationService: DonationService) { }

    ngOnInit(): void {
        this.refresh();
    }

    refresh(): void {
        this.loading = true;
        this.donationService.getAllDonations().subscribe({
            next: (data) => {
                this.donations = data;
                this.refreshRequests();
            },
            error: (err) => {
                console.error('Error fetching donations', err);
                this.loading = false;
            }
        });
    }

    refreshRequests(): void {
        this.donationService.getAllAidRequests().subscribe({
            next: (data) => {
                this.aidRequests = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error fetching aid requests', err);
                this.loading = false;
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
}
