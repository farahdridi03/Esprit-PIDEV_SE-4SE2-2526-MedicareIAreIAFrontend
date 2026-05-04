import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StockService } from '../../../../../services/stock.service';
import { Batch, ReceiveBatchRequest } from '../../../../../models/stock.model';
import { ProductService } from '../../../../../services/product.service';
import { Product } from '../../../../../models/product.model';
import { PharmacyService } from '../../../../../services/pharmacy.service';
import { Pharmacy } from '../../../../../models/pharmacy.model';

@Component({
  selector: 'app-batches-list',
  templateUrl: './batches-list.component.html',
  styleUrls: ['./batches-list.component.scss']
})
export class BatchesListComponent implements OnInit {
  pharmacyStockId!: number;
  batches: Batch[] = [];
  loading = false;
  error: string | null = null;
  showForm = false;

  products: Product[] = [];
  pharmacies: Pharmacy[] = [];

  formModel: ReceiveBatchRequest = {
    pharmacyId: 0,
    productId: 0,
    batchNumber: '',
    quantity: 0,
    expirationDate: '',
    purchasePrice: 0,
    sellingPrice: 0,
    minQuantityThreshold: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stockService: StockService,
    private productService: ProductService,
    private pharmacyService: PharmacyService
  ) {}

  ngOnInit(): void {
    this.pharmacyStockId = Number(this.route.snapshot.paramMap.get('pharmacyStockId'));
    this.loadBatches();
    this.productService.getAllProducts().subscribe({ next: (p) => this.products = p });
    this.pharmacyService.getAllPharmacies().subscribe({ next: (p) => this.pharmacies = p });
  }

  loadBatches(): void {
    this.loading = true;
    this.error = null;
    this.stockService.getBatchesByStockId(this.pharmacyStockId).subscribe({
      next: (res) => {
        this.batches = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load batches', err);
        this.error = 'Failed to load batches.';
        this.loading = false;
      }
    });
  }

  openForm(): void {
    this.formModel = {
      pharmacyId: 0,
      productId: 0,
      batchNumber: '',
      quantity: 0,
      expirationDate: '',
      purchasePrice: 0,
      sellingPrice: 0,
      minQuantityThreshold: 0
    };
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
  }

  saveBatch(): void {
    this.loading = true;
    this.stockService.receiveBatch(this.formModel).subscribe({
      next: () => {
        this.showForm = false;
        this.loadBatches();
      },
      error: (err) => {
        console.error('Failed to receive batch', err);
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/pharmacist/inventory']);
  }
}
