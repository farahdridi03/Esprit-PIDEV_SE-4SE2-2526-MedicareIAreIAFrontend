import { Component, OnInit } from '@angular/core';
import { HomecareService } from '../../../../services/homecare.service';
import { ServiceProvider } from '../../../../models/homecare.model';

@Component({
  selector: 'app-admin-providers',
  templateUrl: './admin-providers.component.html',
  styleUrls: ['./admin-providers.component.scss']
})
export class AdminProvidersComponent implements OnInit {
  providers: ServiceProvider[] = [];
  filteredProviders: ServiceProvider[] = [];
  
  isLoading = true;
  error = '';
  searchQuery = '';
  filterStatus = 'ALL'; // ALL, VERIFIED, UNVERIFIED

  constructor(private homecare: HomecareService) {}

  ngOnInit(): void {
    this.loadProviders();
  }

  loadProviders(): void {
    this.isLoading = true;
    this.homecare.getAllProviders().subscribe({
      next: (data) => {
        this.providers = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load providers list.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredProviders = this.providers.filter(p => {
      const matchesSearch = !this.searchQuery || 
        p.user?.fullName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.user?.email?.toLowerCase().includes(this.searchQuery.toLowerCase());
        
      const matchesStatus = this.filterStatus === 'ALL' || 
        (this.filterStatus === 'VERIFIED' && p.verified) || 
        (this.filterStatus === 'UNVERIFIED' && !p.verified);
        
      return matchesSearch && matchesStatus;
    });
  }

  verifyProvider(id: number, currentStatus: boolean): void {
    if (currentStatus) return; // Already verified
    if (confirm('Are you sure you want to verify this provider? Ensuring their certification has been manually reviewed is required.')) {
      this.homecare.verifyProvider(id).subscribe({
        next: () => {
          this.loadProviders(); // Reload to get updated state
        },
        error: (err) => {
          alert('Failed to verify provider: ' + (err.error?.message || 'Unknown error.'));
        }
      });
    }
  }
}
