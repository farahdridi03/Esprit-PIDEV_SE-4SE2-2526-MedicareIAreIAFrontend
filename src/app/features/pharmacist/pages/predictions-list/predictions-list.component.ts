import { Component, OnInit } from '@angular/core';
import { StockService } from '../../../../services/stock.service';
import { PharmacyService } from '../../../../services/pharmacy.service';
import { ReplenishmentPrediction } from '../../../../models/stock.model';
import { Pharmacy } from '../../../../models/pharmacy.model';

@Component({
  selector: 'app-predictions-list',
  templateUrl: './predictions-list.component.html',
  styleUrls: ['./predictions-list.component.scss']
})
export class PredictionsListComponent implements OnInit {
  predictions: ReplenishmentPrediction[] = [];
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
          this.loadPredictions();
        }
      },
      error: (err) => {
        console.error('Failed to load pharmacies', err);
      }
    });
  }

  onPharmacyChange() {
    this.loadPredictions();
  }

  loadPredictions(): void {
    if (!this.activePharmacyId) return;
    this.isLoading = true;
    this.errorMessage = null;

    this.stockService.predictReplenishment(this.activePharmacyId).subscribe({
      next: (data: ReplenishmentPrediction[]) => {
        this.predictions = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load predictions:', err);
        this.errorMessage = 'Could not calculate prediction data. Please try again later.';
        this.isLoading = false;
      }
    });
  }
}
