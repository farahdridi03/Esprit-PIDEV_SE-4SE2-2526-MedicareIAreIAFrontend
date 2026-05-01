import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StockService } from '../../../../../services/stock.service';
import { StockMovement, StockMovementRequest } from '../../../../../models/stock.model';

@Component({
  selector: 'app-movements-list',
  templateUrl: './movements-list.component.html',
  styleUrls: ['./movements-list.component.scss']
})
export class MovementsListComponent implements OnInit {
  pharmacyStockId!: number;
  movements: StockMovement[] = [];
  loading = false;
  error: string | null = null;
  showForm = false;

  currentPage = 1; pageSize = 8;
  get totalPages() { return Math.ceil(this.movements.length / this.pageSize); }
  get pagedMovements() { const s = (this.currentPage - 1) * this.pageSize; return this.movements.slice(s, s + this.pageSize); }
  get pages() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pageEnd() { return Math.min(this.currentPage * this.pageSize, this.movements.length); }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }

  movementTypes = ['IN', 'OUT', 'ADJUSTMENT', 'RETURN', 'TRANSFER'];

  formModel: StockMovementRequest = {
    pharmacyStockId: 0,
    movementType: 'IN',
    quantity: 0,
    reference: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stockService: StockService
  ) {}

  ngOnInit(): void {
    this.pharmacyStockId = Number(this.route.snapshot.paramMap.get('pharmacyStockId'));
    this.formModel.pharmacyStockId = this.pharmacyStockId;
    this.loadMovements();
  }

  loadMovements(): void {
    this.loading = true;
    this.error = null;
    this.stockService.getMovementsByStockId(this.pharmacyStockId).subscribe({
      next: (res) => {
        this.movements = res;
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load movements', err);
        this.error = 'Failed to load movements.';
        this.loading = false;
      }
    });
  }

  openForm(): void {
    this.formModel = {
      pharmacyStockId: this.pharmacyStockId,
      movementType: 'IN',
      quantity: 0,
      reference: ''
    };
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
  }

  saveMovement(): void {
    this.loading = true;
    this.stockService.addMovement(this.formModel).subscribe({
      next: () => {
        this.showForm = false;
        this.loadMovements();
      },
      error: (err) => {
        console.error('Failed to add movement', err);
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/pharmacist/inventory']);
  }
}
