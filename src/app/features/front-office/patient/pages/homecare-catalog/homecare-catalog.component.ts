import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HomecareService } from '../../../../../services/homecare.service';
import { HomeCareService } from '../../../../../models/homecare.model';

@Component({
  selector: 'app-homecare-catalog',
  templateUrl: './homecare-catalog.component.html',
  styleUrls: ['./homecare-catalog.component.scss']
})
export class HomecareCatalogComponent implements OnInit {
  services: HomeCareService[] = [];
  isLoading = true;
  error = '';

  constructor(
    private homecareService: HomecareService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.homecareService.getAllServices().subscribe({
      next: (data) => {
        this.services = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load services.';
        this.isLoading = false;
      }
    });
  }

  bookService(serviceId: number): void {
    this.router.navigate(['/front/patient/homecare/book', serviceId]);
  }
}
