import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StockService } from '../../../../../services/stock.service';
import { PharmacyService } from '../../../../../services/pharmacy.service';
import { ProductService } from '../../../../../services/product.service';
import { Batch } from '../../../../../models/stock.model';
import { Pharmacy } from '../../../../../models/pharmacy.model';
import { Product } from '../../../../../models/product.model';

@Component({
  selector: 'app-batches-list',
  templateUrl: './batches-list.component.html',
  styleUrls: ['./batches-list.component.scss']
})
export class BatchesListComponent implements OnInit {
  stockId!: number;
  batches: Batch[] = [];
  loading = false;

  viewState: 'list' | 'add' = 'list';
  fieldErrors: { [key: string]: string } = {};
  globalError: string | null = null;
  todayDate: string;

  pharmacies: Pharmacy[] = [];
  products: Product[] = [];

  formModel: any = {
    pharmacyId: null,
    productId: null,
    batchNumber: '',
    quantity: 1,
    expirationDate: '',
    purchasePrice: 0,
    sellingPrice: 0,
    minQuantityThreshold: 10
  };

  constructor(
    private route: ActivatedRoute,
    private stockService: StockService,
    private pharmacyService: PharmacyService,
    private productService: ProductService
  ) {
    this.todayDate = new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.stockId = Number(params.get('pharmacyStockId'));
      if (this.stockId) this.loadBatches();
    });
    this.loadDropdowns();
  }

  loadBatches() {
    this.loading = true;
    this.stockService.getBatchesByStockId(this.stockId).subscribe({
      next: res => { this.batches = res; this.loading = false; },
      error: err => { console.error(err); this.loading = false; }
    });
  }

  loadDropdowns() {
    this.pharmacyService.getAllPharmacies().subscribe(res => this.pharmacies = res);
    this.productService.getAllProducts().subscribe(res => this.products = res);
  }

  viewAdd() {
    this.formModel = {
      pharmacyId: null,
      productId: null,
      batchNumber: '',
      quantity: 1,
      expirationDate: '',
      purchasePrice: 0,
      sellingPrice: 0,
      minQuantityThreshold: 10
    };

    // Attempt to guess the pharmacy/product if we knew them, but here we don't naturally 
    // know them without fetching the stock. We'll leave them to be manually selected.

    this.fieldErrors = {};
    this.globalError = null;
    this.viewState = 'add';
  }

  cancelForm() {
    this.viewState = 'list';
  }

  saveBatch() {
    this.loading = true;
    this.fieldErrors = {};
    this.globalError = null;

    this.stockService.receiveBatch(this.formModel).subscribe({
      next: () => {
        this.viewState = 'list';
        this.loadBatches(); // Reload batches for this stock
      },
      error: (err) => {
        this.loading = false;

        if (err.error?.fields) {
          this.fieldErrors = err.error.fields;
        } else if (err.error?.message) {
          this.globalError = err.error.message;
        } else {
          this.globalError = 'Failed to receive batch.';
        }
      }
    });
  }
}