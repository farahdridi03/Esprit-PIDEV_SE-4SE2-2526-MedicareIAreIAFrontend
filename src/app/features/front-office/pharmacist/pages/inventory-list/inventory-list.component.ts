import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StockService } from '../../../../../services/stock.service';
import { PharmacyService } from '../../../../../services/pharmacy.service';
import { PharmacyStock } from '../../../../../models/stock.model';
import { Pharmacy } from '../../../../../models/pharmacy.model';

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss']
})
export class InventoryListComponent implements OnInit {
  pharmacies: Pharmacy[] = [];
  selectedPharmacyId: number | null = null;
  stocks: PharmacyStock[] = [];
  loading = false;

  constructor(
    private stockService: StockService,
    private pharmacyService: PharmacyService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPharmacies();
  }

  loadPharmacies() {
    this.pharmacyService.getAllPharmacies().subscribe((res: Pharmacy[]) => {
      this.pharmacies = res;
      if (res.length > 0) {
        this.selectedPharmacyId = res[0].id;
        this.loadInventory();
      }
    });
  }

  onPharmacyChange() {
    this.loadInventory();
  }

  loadInventory() {
    if (!this.selectedPharmacyId) return;
    this.loading = true;
    this.stockService.getStockByPharmacyId(this.selectedPharmacyId).subscribe({
      next: (res: PharmacyStock[]) => {
        this.stocks = res;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to get inventory', err);
        this.loading = false;
      }
    });
  }

  viewBatches(stockId: number) {
    this.router.navigate(['/pharmacist/stock/batches', stockId]);
  }

  viewMovements(stockId: number) {
    this.router.navigate(['/pharmacist/stock/movements', stockId]);
  }
}