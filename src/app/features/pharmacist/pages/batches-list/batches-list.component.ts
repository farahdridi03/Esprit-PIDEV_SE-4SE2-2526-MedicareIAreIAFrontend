import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StockService } from '../../../../services/stock.service';
import { Batch } from '../../../../models/stock.model';

@Component({
  selector: 'app-batches-list',
  templateUrl: './batches-list.component.html',
  styleUrls: ['./batches-list.component.scss']
})
export class BatchesListComponent implements OnInit {
  stockId!: number;
  batches: Batch[] = [];
  loading = false;

  constructor(private route: ActivatedRoute, private stockService: StockService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.stockId = Number(params.get('pharmacyStockId'));
      if (this.stockId) this.loadBatches();
    });
  }

  loadBatches() {
    this.loading = true;
    this.stockService.getBatchesByStockId(this.stockId).subscribe({
      next: res => { this.batches = res; this.loading = false; },
      error: err => { console.error(err); this.loading = false; }
    });
  }
}
