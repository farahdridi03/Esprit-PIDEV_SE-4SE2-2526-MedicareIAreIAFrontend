import { Component, AfterViewInit, OnInit } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { StockService } from '../../../../services/stock.service';
import { EventService } from '../../../../services/event.service';
import { AnalyticsService, AnalyticsSummary } from '../../../../services/analytics.service';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

declare var Chart: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  firstName: string = 'Admin';
  stockSummary: any[] = [];
  eventStats: any[] = [];
  
  searchForm: FormGroup;
  searchResults: any = { products: [], events: [] };
  isSearching: boolean = false;
  analyticsSummary?: AnalyticsSummary;

  private growthChart: any;
  private roleChart: any;

  constructor(
    private userService: UserService, 
    private authService: AuthService,
    private stockService: StockService,
    private eventService: EventService,
    private analyticsService: AnalyticsService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      keyword: ['']
    });
  }

  ngOnInit() {
    this.loadUserInfo();
    this.userService.getProfile().subscribe({
      next: (user) => {
        if (user && user.fullName) {
          const parts = user.fullName.split(' ');
          this.firstName = parts[0];
        }
      }
    });
    this.loadAdvancedStats();
    this.initSearch();
  }

  private initSearch() {
    this.searchForm.get('keyword')?.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(keyword => {
        if (!keyword || keyword.length < 2) {
          this.searchResults = { products: [], events: [] };
          return of(null);
        }
        this.isSearching = true;
        return forkJoin({
          products: this.stockService.searchProducts(keyword).pipe(catchError(() => of({ content: [] }))),
          events: this.eventService.searchEvents(keyword).pipe(catchError(() => of({ content: [] })))
        }).pipe(
          finalize(() => this.isSearching = false)
        );
      })
    ).subscribe(results => {
      if (results) {
        this.searchResults = {
          products: results.products.content,
          events: results.events.content
        };
      }
    });
  }

  private loadAdvancedStats() {
    this.stockService.getStockSummary().subscribe(data => {
      this.stockSummary = data;
    });
    this.eventService.getEventStats().subscribe(data => {
      this.eventStats = data;
    });
    this.analyticsService.getSummary().subscribe(data => {
      this.analyticsSummary = data;
      this.updateCharts();
    });
  }

  private loadUserInfo() {
    const fullName = this.authService.getUserFullName();
    if (fullName) {
      const parts = fullName.split(' ');
      this.firstName = parts[0];
    }
  }

  ngAfterViewInit(): void {
    this.initCharts();
  }

  private initCharts() {
    // Initial empty/placeholder charts
    const gCtx = document.getElementById('growthChart') as HTMLCanvasElement;
    if (gCtx) {
      this.growthChart = new Chart(gCtx.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr'],
          datasets: [{
            label: 'Users',
            data: [0, 0, 0, 0],
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79,70,229,0.07)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { grid: { display: false } }, y: { grid: { color: '#ebebf5' } } }
        }
      });
    }

    const rCtx = document.getElementById('roleChart') as HTMLCanvasElement;
    if (rCtx) {
      this.roleChart = new Chart(rCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Patients', 'Doctors', 'Admins'],
          datasets: [{
            data: [0, 0, 0],
            backgroundColor: ['#4f46e5', '#0d9488', '#f59e0b'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          cutout: '70%',
          plugins: { legend: { display: false } }
        }
      });
    }
  }

  private updateCharts() {
    if (!this.analyticsSummary) return;

    // Update Growth Chart
    if (this.growthChart) {
      this.growthChart.data.labels = this.analyticsSummary.userGrowth.map(g => g.month);
      this.growthChart.data.datasets[0].data = this.analyticsSummary.userGrowth.map(g => g.count);
      this.growthChart.update();
    }

    // Update Role Chart
    if (this.roleChart) {
      const roles = ['PATIENT', 'DOCTOR', 'ADMIN'];
      const data = roles.map(r => this.analyticsSummary?.usersByRole[r] || 0);
      this.roleChart.data.datasets[0].data = data;
      this.roleChart.update();
    }
  }

}
