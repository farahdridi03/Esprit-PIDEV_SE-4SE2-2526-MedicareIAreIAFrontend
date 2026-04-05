import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Donation, DonationStatus, DonationType, AidRequest, AidRequestStatus } from '../../../../../models/donation.model';
import { DonationService } from '../../../../../services/donation.service';
import { AuthService } from '../../../../../services/auth.service';
import { UserService } from '../../../../../services/user.service';
import { NotificationService } from '../../../../../services/notification.service';

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

  error: string = '';

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

  // Image / Camera
  imageMode: 'upload' | 'camera' = 'upload';
  cameraStream: MediaStream | null = null;
  photoTaken = false;

  @ViewChild('cameraVideo') cameraVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('cameraCanvas') cameraCanvasRef!: ElementRef<HTMLCanvasElement>;

  // Aid Request fields
  myAidRequests: AidRequest[] = [];
  isRequestModalOpen = false;
  requestDescription = '';
  requestDoc = '';
  currentPatientId: number | null = null;
  currentUserName: string = '';
  editingRequestId: number | null = null;

  constructor(
    private donationService: DonationService,
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.currentUserName = this.authService.getUserFullName() || '';
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

    // Fallback: fetch current user profile
    const email = this.authService.getUserEmail();
    if (!email) return;

    this.userService.getProfile().subscribe({
      next: (user: any) => {
        if (user && user.id) {
          this.currentPatientId = user.id;
          if (!this.currentUserName) {
            this.currentUserName = user.firstName ? `${user.firstName} ${user.lastName}` : user.fullName || 'Anonyme';
          }
          this.loadMyRequests();
        }
      },
      error: (err) => console.error('Error fetching user profile:', err)
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
        console.log('Donations loaded:', data);
        this.donations = data || [];
      },
      error: (err: any) => {
        console.error('Error fetching donations', err);
        this.donations = [];
      }
    });
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
  }

  filteredDonations(): Donation[] {
    if (!this.donations) return [];
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
    this.error = '';
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.stopCamera();
    this.imageMode = 'upload';
    this.resetForm();
    this.error = '';
  }

  resetForm(): void {
    this.currentDonation = {
      type: DonationType.MONEY,
      donorName: this.currentUserName || 'Anonyme',
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
    this.error = '';

    // Attach current user as the creator
    if (this.currentPatientId) {
      payload.creatorId = this.currentPatientId;
    }

    // Guard: creatorId is @NotNull on the backend — block if still missing
    if (!this.editingDonationId && !payload.creatorId) {
      this.error = 'Impossible d\'identifier votre compte. Veuillez rafraîchir la page et réessayer.';
      return;
    }

    if (this.editingDonationId) {
      this.donationService.updateDonation(this.editingDonationId, payload).subscribe({
        next: () => {
          this.loadDonations();
          this.closeModal();
        },
        error: (err: any) => this.handleSaveError(err)
      });
    } else {
      this.donationService.createDonation(payload).subscribe({
        next: () => {
          this.loadDonations();
          this.closeModal();
        },
        error: (err: any) => this.handleSaveError(err)
      });
    }
  }

  handleSaveError(err: any): void {
    console.error('Error saving donation', err);
    if (err.error?.details) {
      const details = Object.entries(err.error.details)
         .map(([field, msg]) => `${field}: ${msg}`)
         .join(' | ');
      this.error = `Erreur de validation: ${details}`;
    } else if (err.error?.message) {
      this.error = err.error.message;
    } else if (typeof err.error === 'string') {
      this.error = err.error;
    } else {
      this.error = `Erreur lors de l'enregistrement de la donation (statut ${err.status}).`;
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

  // ── CAMERA ──────────────────────────────────────────────

  setImageMode(mode: 'upload' | 'camera'): void {
    if (this.imageMode !== mode) {
      this.stopCamera();
      this.photoTaken = false;
    }
    this.imageMode = mode;
  }

  startCamera(): void {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        this.cameraStream = stream;
        this.photoTaken = false;
        setTimeout(() => {
          if (this.cameraVideoRef?.nativeElement) {
            this.cameraVideoRef.nativeElement.srcObject = stream;
          }
        }, 100);
      })
      .catch(err => {
        console.error('Camera error:', err);
        alert('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      });
  }

  capturePhoto(): void {
    const video = this.cameraVideoRef?.nativeElement;
    const canvas = this.cameraCanvasRef?.nativeElement;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    this.currentDonation.imageData = canvas.toDataURL('image/jpeg', 0.85);
    this.photoTaken = true;
    this.stopCamera();
  }

  retakePhoto(): void {
    this.photoTaken = false;
    this.currentDonation.imageData = undefined;
    this.startCamera();
  }

  stopCamera(): void {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(t => t.stop());
      this.cameraStream = null;
    }
  }

  // ─────────────────────────────────────────────────────────

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
    this.reqError = '';
  }

  closeRequestModal(): void {
    this.isRequestModalOpen = false;
    this.editingRequestId = null;
    this.requestDescription = '';
    this.requestDoc = '';
    this.reqError = '';
  }

  openEditRequestModal(req: AidRequest): void {
    this.editingRequestId = req.id || null;
    this.requestDescription = req.description;
    this.requestDoc = req.supportingDocument || '';
    this.reqError = '';
    this.isRequestModalOpen = true;
  }

  onRequestFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) { // 20MB max
         alert('File is too large! Maximum 20MB allowed.');
         return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.requestDoc = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  downloadOrViewDoc(base64: string): void {
    if (!base64) return;
    if (base64.startsWith('http')) {
        window.open(base64, '_blank');
        return;
    }
    const a = document.createElement('a');
    a.href = base64;
    a.download = 'supporting-document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  reqError: string = '';
  reqFieldErrors: any = {};

  validateAidRequest(): boolean {
    this.reqFieldErrors = {};
    let isValid = true;
    
    if (!this.requestDescription || this.requestDescription.trim().length === 0) {
      this.reqFieldErrors.description = 'La description est requise.';
      isValid = false;
    } else if (this.requestDescription.trim().length < 10 || this.requestDescription.trim().length > 500) {
      this.reqFieldErrors.description = 'La description doit comporter entre 10 et 500 caractères.';
      isValid = false;
    }
    
    return isValid;
  }

  submitAidRequest(): void {
    if (!this.currentPatientId) {
      alert("Could not find your Patient ID. Please try refreshing or re-login.");
      return;
    }

    this.reqError = '';
    
    if (!this.validateAidRequest()) {
      return;
    }

    const reqDto = {
      patientId: this.currentPatientId,
      description: this.requestDescription,
      supportingDocument: this.requestDoc
    };

    if (this.editingRequestId) {
      this.donationService.updateAidRequest(this.editingRequestId, reqDto).subscribe({
        next: () => {
          this.closeRequestModal();
          this.loadMyRequests();
        },
        error: (err: any) => this.handleReqError(err)
      });
    } else {
      this.donationService.createAidRequest(reqDto).subscribe({
        next: () => {
          // 🔔 Notify admin
          this.notificationService.addNotification(
            'Nouvelle demande d\'aide',
            `${this.currentUserName || 'Un patient'} a soumis une nouvelle demande d'aide.`,
            'aid_request'
          );
          this.closeRequestModal();
          this.loadMyRequests();
        },
        error: (err: any) => this.handleReqError(err)
      });
    }
  }

  handleReqError(err: any): void {
    console.error('Error with aid request', err);
    if (err.error && err.error.details) {
      const details = Object.entries(err.error.details)
         .map(([field, msg]) => `${field}: ${msg}`)
         .join(' | ');
      this.reqError = `Validation error: ${details}`;
    } else {
      this.reqError = 'Error saving the request.';
    }
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
