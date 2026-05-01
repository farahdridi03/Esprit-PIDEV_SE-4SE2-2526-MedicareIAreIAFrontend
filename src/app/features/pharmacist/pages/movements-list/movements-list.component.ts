import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StockService } from '../../../../services/stock.service';
import { StockMovement, StockMovementRequest } from '../../../../models/stock.model';

@Component({
  selector: 'app-movements-list',
  templateUrl: './movements-list.component.html',
  styleUrls: ['./movements-list.component.scss']
})
export class MovementsListComponent implements OnInit {
  stockId!: number;
  movements: StockMovement[] = [];
  loading = false;
  viewState: 'list' | 'add' = 'list';
  fieldErrors: { [key: string]: string } = {};
  globalError: string | null = null;

  formModel: StockMovementRequest = {
    pharmacyStockId: 0,
    movementType: 'IN',
    quantity: 1,
    reference: ''
  };

  movementTypes = ['IN', 'OUT', 'ADJUSTMENT', 'RETURN', 'TRANSFER'];

  constructor(private route: ActivatedRoute, private stockService: StockService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.stockId = Number(params.get('pharmacyStockId'));
      if (this.stockId) {
        this.formModel.pharmacyStockId = this.stockId;
        this.loadMovements();
      }
    });
  }

  loadMovements() {
    this.loading = true;
    this.stockService.getMovementsByStockId(this.stockId).subscribe({
      next: res => { this.movements = res; this.loading = false; },
      error: err => { console.error(err); this.loading = false; }
    });
  }

  viewAdd() {
    this.formModel = {
      pharmacyStockId: this.stockId,
      movementType: 'IN',
      quantity: 1,
      reference: ''
    };
    this.fieldErrors = {};
    this.globalError = null;
    this.viewState = 'add';
  }

  cancelForm() {
    this.viewState = 'list';
  }

  saveMovement() {
    this.loading = true;
    this.fieldErrors = {};
    this.globalError = null;

    this.stockService.addMovement(this.formModel).subscribe({
      next: () => {
        this.viewState = 'list';
        this.loadMovements();
      },
      error: err => {
        console.error(err);
        this.loading = false;
        
        if (err.error?.fields) {
          this.fieldErrors = err.error.fields;
        } else if (err.error?.message) {
          this.globalError = err.error.message;
        } else {
          this.globalError = 'An unexpected error occurred while saving the movement.';
        }
      }
    });
  }
}
