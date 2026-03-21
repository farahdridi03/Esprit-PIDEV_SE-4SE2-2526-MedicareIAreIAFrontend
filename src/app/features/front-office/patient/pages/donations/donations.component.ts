import { Component, OnInit } from '@angular/core';
import { Donation, DonationStatus, DonationType, AidRequest, AidRequestStatus } from '../../../../../models/donation.model';
import { DonationService } from '../../../../../services/donation.service';
import { AuthService } from '../../../../../services/auth.service';
import { UserService } from '../../../../../services/user.service';

@Component({
  selector: 'app-donations',
  templateUrl: './donations.component.html',
  styleUrls: ['./donations.component.scss']
})
export class DonationsComponent implements OnInit {
  donations: Donation[] = [];

  isModalOpen = false;
  editingDonationId: number | null = null;
  selectedFile: File | null = null;

  DonationType = DonationType;
  DonationStatus = DonationStatus;
  AidRequestStatus = AidRequestStatus;

  currentDonation: Partial<Donation> = {
    type: DonationType.MONEY,
    donorName: '',
    status: DonationStatus.AVAILABLE,
    amount: undefined,
    categorie: '',
    description: '',
    quantite: undefined,
    imageData: undefined
  };

  currentFilter: string = 'all';

  // Aid Request fields
  myAidRequests: AidRequest[] = [];
  isRequestModalOpen = false;
  requestDescription = '';
  requestDoc = '';
  currentPatientId: number | null = null;

  constructor(
    private donationService: DonationService,
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadDonations();
    this.resolvePatientId();
  }

  resolvePatientId(): void {
    const pId = this.authService.getUserId();
    if (pId) {
      this.currentPatientId = pId;
      this.loadMyRequests();
      return;
    }

    // Fallback: fetch users and find by email
    const email = this.authService.getUserEmail();
    if (!email) return;

    this.userService.getAll().subscribe({
      next: (users) => {
        const user = users.find(u => u.email === email);
        if (user && user.id) {
          this.currentPatientId = user.id;
          this.loadMyRequests();
        }
      },
      error: (err) => console.error('Error fetching users:', err)
    });
  }

  loadMyRequests(): void {
    if (!this.currentPatientId) return;

    this.donationService.getAidRequestsByPatient(this.currentPatientId).subscribe({
      next: (data) => {
        this.myAidRequests = data;
      },
      error: (err) => console.error('Error fetching aid requests', err)
    });
  }

  loadDonations(): void {
    this.donationService.getAllDonations().subscribe({
      next: (data: Donation[]) => {
        this.donations = data;
      },
      error: (err: any) => console.error('Error fetching donations', err)
    });
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
  }

  filteredDonations(): Donation[] {
    return this.donations.filter(d => {
      const matchFilter =
        this.currentFilter === 'all' ||
        (this.currentFilter === 'money' && d.type === DonationType.MONEY) ||
        (this.currentFilter === 'materiel' && d.type === DonationType.MATERIEL) ||
        (this.currentFilter === 'available' && d.status === DonationStatus.AVAILABLE) ||
        (this.currentFilter === 'assigned' && d.status === DonationStatus.ASSIGNED);
      return matchFilter;
    });
  }

  getInitials(name: string | undefined): string {
    if (!name) return 'UN';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  openModal(donation?: Donation): void {
    if (donation) {
      this.editingDonationId = donation.id || null;
      this.currentDonation = { ...donation };
    } else {
      this.editingDonationId = null;
      this.resetForm();
    }
    this.selectedFile = null;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.currentDonation = {
      type: DonationType.MONEY,
      donorName: '',
      status: DonationStatus.AVAILABLE,
      amount: undefined,
      categorie: '',
      description: '',
      quantite: undefined,
      imageData: undefined
    };
    this.selectedFile = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.currentDonation.imageData = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveDonation(): void {
    const payload = { ...this.currentDonation } as Donation;
    delete payload.imageData;

    if (this.editingDonationId) {
      this.donationService.updateDonation(this.editingDonationId, payload, this.selectedFile || undefined).subscribe({
        next: () => {
          this.loadDonations();
          this.closeModal();
        },
        error: (err: any) => console.error('Error updating donation', err)
      });
    } else {
      this.donationService.createDonation(payload, this.selectedFile || undefined).subscribe({
        next: () => {
          this.loadDonations();
          this.closeModal();
        },
        error: (err: any) => console.error('Error creating donation', err)
      });
    }
  }

  deleteDonation(id: number | undefined): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this donation?')) {
      this.donationService.deleteDonation(id).subscribe({
        next: () => {
          this.loadDonations();
        },
        error: (err: any) => console.error('Error deleting donation', err)
      });
    }
  }

  getImageUrl(donation: Donation | Partial<Donation>): string {
    if (!donation.imageData) return '';
    if (donation.imageData.startsWith('data:')) {
      return donation.imageData;
    }
    const contentType = donation.imageContentType || 'image/jpeg';
    return `data:${contentType};base64,${donation.imageData}`;
  }

  // --- AID REQUEST ---

  openRequestModal(): void {
    this.isRequestModalOpen = true;
    this.requestDescription = '';
    this.requestDoc = '';
  }

  closeRequestModal(): void {
    this.isRequestModalOpen = false;
    this.requestDescription = '';
    this.requestDoc = '';
  }

  submitAidRequest(): void {
    if (!this.currentPatientId) {
      alert("Could not find your Patient ID. Please try refreshing or re-login.");
      return;
    }

    const reqDto = {
      patientId: this.currentPatientId,
      description: this.requestDescription,
      supportingDocument: this.requestDoc
    };

    this.donationService.createAidRequest(reqDto).subscribe({
      next: () => {
        alert('Aid request submitted successfully!');
        this.closeRequestModal();
        this.loadMyRequests();
      },
      error: (err: any) => {
        console.error('Error creating aid request', err);
        alert('Failed to submit aid request.');
      }
    });
  }

  deleteAidRequest(id: number | undefined): void {
    if (!id) return;
    if (confirm('Are you sure you want to cancel this request?')) {
      this.donationService.deleteAidRequest(id).subscribe({
        next: () => {
          this.loadMyRequests();
        },
        error: (err: any) => console.error('Error deleting aid request', err)
      });
    }
  }
}
