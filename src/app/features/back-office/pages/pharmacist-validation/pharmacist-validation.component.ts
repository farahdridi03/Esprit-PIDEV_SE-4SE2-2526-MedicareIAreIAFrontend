import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../services/admin.service';

@Component({
  selector: 'app-pharmacist-validation',
  templateUrl: './pharmacist-validation.component.html',
  styleUrls: ['./pharmacist-validation.component.scss']
})
export class PharmacistValidationComponent implements OnInit {

  activeTab: 'PHARMACISTS' | 'PROVIDERS' = 'PHARMACISTS';
  pendingPharmacists: any[] = [];
  pendingProviders: any[] = [];
  isLoading: boolean = true;
  selectedDocument: string | null = null;

  pharmPage = 1; provPage = 1; pageSize = 5;
  get pharmTotalPages() { return Math.ceil(this.pendingPharmacists.length / this.pageSize); }
  get pagedPharmacists() { const s = (this.pharmPage - 1) * this.pageSize; return this.pendingPharmacists.slice(s, s + this.pageSize); }
  get pharmPages() { return Array.from({ length: this.pharmTotalPages }, (_, i) => i + 1); }
  get pharmPageEnd() { return Math.min(this.pharmPage * this.pageSize, this.pendingPharmacists.length); }
  goToPharmPage(p: number) { if (p >= 1 && p <= this.pharmTotalPages) this.pharmPage = p; }

  get provTotalPages() { return Math.ceil(this.pendingProviders.length / this.pageSize); }
  get pagedProviders() { const s = (this.provPage - 1) * this.pageSize; return this.pendingProviders.slice(s, s + this.pageSize); }
  get provPages() { return Array.from({ length: this.provTotalPages }, (_, i) => i + 1); }
  get provPageEnd() { return Math.min(this.provPage * this.pageSize, this.pendingProviders.length); }
  goToProvPage(p: number) { if (p >= 1 && p <= this.provTotalPages) this.provPage = p; }

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    if (this.activeTab === 'PHARMACISTS') {
      this.loadPendingPharmacists();
    } else {
      this.loadPendingProviders();
    }
  }

  switchTab(tab: 'PHARMACISTS' | 'PROVIDERS'): void {
    this.activeTab = tab;
    this.loadData();
  }

  loadPendingPharmacists(): void {
    this.adminService.getPendingPharmacists().subscribe({
      next: (data) => {
        this.pendingPharmacists = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading pending pharmacists:', err);
        this.isLoading = false;
      }
    });
  }

  loadPendingProviders(): void {
    this.adminService.getPendingProviders().subscribe({
      next: (data) => {
        this.pendingProviders = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading pending providers:', err);
        this.isLoading = false;
      }
    });
  }

  approvePharmacist(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir approuver ce pharmacien ?')) {
      this.adminService.approvePharmacist(id).subscribe({
        next: () => {
          this.pendingPharmacists = this.pendingPharmacists.filter(p => p.id !== id);
          alert('Le pharmacien a été approuvé avec succès.');
        },
        error: (err) => {
          console.error('Error approving pharmacist:', err);
          alert('Erreur lors de l\'approbation.');
        }
      });
    }
  }

  rejectPharmacist(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir rejeter cette demande ? L\'utilisateur sera supprimé.')) {
      this.adminService.rejectPharmacist(id).subscribe({
        next: () => {
          this.pendingPharmacists = this.pendingPharmacists.filter(p => p.id !== id);
          alert('La demande a été rejetée et l\'utilisateur supprimé.');
        },
        error: (err) => {
          console.error('Error rejecting pharmacist:', err);
          alert('Erreur lors du rejet.');
        }
      });
    }
  }

  approveProvider(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir approuver ce prestataire ?')) {
      this.adminService.approveProvider(id).subscribe({
        next: () => {
          this.pendingProviders = this.pendingProviders.filter(p => p.id !== id);
          alert('Le prestataire a été approuvé avec succès.');
        },
        error: (err) => {
          console.error('Error approving provider:', err);
          alert('Erreur lors de l\'approbation.');
        }
      });
    }
  }

  rejectProvider(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir rejeter cette demande ? L\'utilisateur sera supprimé.')) {
      this.adminService.rejectProvider(id).subscribe({
        next: () => {
          this.pendingProviders = this.pendingProviders.filter(p => p.id !== id);
          alert('La demande a été rejetée et l\'utilisateur supprimé.');
        },
        error: (err) => {
          console.error('Error rejecting provider:', err);
          alert('Erreur lors du rejet.');
        }
      });
    }
  }

  viewDocument(url: string | undefined): void {
    if (url) {
      if (url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        this.selectedDocument = 'http://localhost:8081/springsecurity/uploads/' + url;
        window.open(this.selectedDocument, '_blank');
      }
    } else {
      alert('Aucun document disponible.');
    }
  }
}
