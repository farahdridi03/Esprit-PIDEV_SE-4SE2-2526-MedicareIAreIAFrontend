import { Component, OnInit } from '@angular/core';
import { StockService } from '../../../../../services/stock.service';
import { PharmacyService } from '../../../../../services/pharmacy.service';
import { PharmacyStock } from '../../../../../models/stock.model';
import { Pharmacy } from '../../../../../models/pharmacy.model';
import { Router } from '@angular/router';

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
  error: string | null = null;

  currentPage = 1; pageSize = 8;
  get totalPages() { return Math.ceil(this.stocks.length / this.pageSize); }
  get pagedStocks() { const s = (this.currentPage - 1) * this.pageSize; return this.stocks.slice(s, s + this.pageSize); }
  get pages() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pageEnd() { return Math.min(this.currentPage * this.pageSize, this.stocks.length); }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }

  constructor(
    private stockService: StockService,
    private pharmacyService: PharmacyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.pharmacyService.getAllPharmacies().subscribe({
      next: (res) => {
        this.pharmacies = res;
        if (res.length > 0) {
          this.selectedPharmacyId = res[0].id;
          this.loadStock();
        }
      },
      error: (err) => console.error('Failed to load pharmacies', err)
    });
  }

  loadStock(): void {
    if (!this.selectedPharmacyId) return;
    this.loading = true;
    this.error = null;
    this.stockService.getStockByPharmacyId(this.selectedPharmacyId).subscribe({
      next: (res) => {
        this.stocks = res;
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load stock', err);
        this.error = 'Failed to load inventory.';
        this.loading = false;
      }
    });
  }

  onPharmacyChange(): void {
    this.loadStock();
  }

  viewBatches(stockId: number): void {
    this.router.navigate(['/pharmacist/batches', stockId]);
  }

  viewMovements(stockId: number): void {
    this.router.navigate(['/pharmacist/movements', stockId]);
  }

  isLowStock(stock: PharmacyStock): boolean {
    return stock.totalQuantity <= stock.minQuantityThreshold;
  }
}
