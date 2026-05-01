import { Component, OnInit } from '@angular/core';
import { StockService } from '../../../../services/stock.service';
import { PharmacyService } from '../../../../services/pharmacy.service';
import { ExpirationRisk } from '../../../../models/stock.model';
import { Pharmacy } from '../../../../models/pharmacy.model';

@Component({
  selector: 'app-expiration-risks',
  templateUrl: './expiration-risks.component.html',
  styleUrls: ['./expiration-risks.component.scss']
})
export class ExpirationRisksComponent implements OnInit {
  risks: ExpirationRisk[] = [];
  pharmacies: Pharmacy[] = [];
  activePharmacyId: number | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private stockService: StockService,
    private pharmacyService: PharmacyService
  ) {}

  ngOnInit(): void {
    this.loadPharmacies();
  }

  loadPharmacies(): void {
    this.pharmacyService.getAllPharmacies().subscribe({
      next: (res) => {
        this.pharmacies = res;
        if (res.length > 0) {
          this.activePharmacyId = res[0].id;
          this.loadRisks();
        }
      },
      error: (err) => {
        console.error('Failed to load pharmacies', err);
      }
    });
  }

  onPharmacyChange() {
    this.loadRisks();
  }

  loadRisks(): void {
    if (!this.activePharmacyId) return;
    this.isLoading = true;
    this.errorMessage = null;

    this.stockService.getExpirationRiskDashboard(this.activePharmacyId).subscribe({
      next: (data: ExpirationRisk[]) => {
        this.risks = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load expiration risks:', err);
        this.errorMessage = 'Could not load expiration dashboard. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  getBadgeClass(riskLevel: string): string {
    switch(riskLevel) {
      case 'EXPIRED': return 'badge-expired';
      case 'RED': return 'badge-danger';
      case 'ORANGE': return 'badge-warning';
      case 'GREEN': return 'badge-success';
      default: return 'badge-secondary';
    }
  }
}
