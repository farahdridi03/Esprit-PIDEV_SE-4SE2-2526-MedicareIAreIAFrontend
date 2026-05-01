import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PharmacyService } from '../../../../services/pharmacy.service';
import { ProductService } from '../../../../services/product.service';
import { StockService } from '../../../../services/stock.service';

@Component({
  selector: 'app-pharmacist-dashboard',
  templateUrl: './pharmacist-dashboard.component.html',
  styleUrls: ['./pharmacist-dashboard.component.scss']
})
export class PharmacistDashboardComponent implements OnInit {
  pharmaciesCount = 0;
  productsCount = 0;
  alertsCount = 0;

  constructor(
    private router: Router,
    private pharmacyService: PharmacyService,
    private productService: ProductService,
    private stockService: StockService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.pharmacyService.getAllPharmacies().subscribe(data => this.pharmaciesCount = data.length);
    this.productService.getAllProducts().subscribe(data => this.productsCount = data.length);
    this.stockService.getAllOpenAlerts().subscribe(data => this.alertsCount = data.length);
  }

  navigate(path: string): void {
    this.router.navigate(['/pharmacist/stock', path]);
  }
}
