import { Component, OnInit } from '@angular/core';
import { HomecareService } from '../../../../services/homecare.service';
import { ServiceRequest } from '../../../../models/homecare.model';

@Component({
  selector: 'app-admin-requests',
  templateUrl: './admin-requests.component.html',
  styleUrls: ['./admin-requests.component.scss']
})
export class AdminRequestsComponent implements OnInit {
  requests: ServiceRequest[] = [];
  filteredRequests: ServiceRequest[] = [];
  
  isLoading = true;
  error = '';
  searchQuery = '';
  filterStatus = 'ALL'; 

  constructor(private homecare: HomecareService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.homecare.getAllRequests().subscribe({
      next: (data) => {
        this.requests = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load requests list.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredRequests = this.requests.filter(r => {
      const matchesSearch = !this.searchQuery || 
        r.patient?.firstName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        r.patient?.lastName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        r.service?.name?.toLowerCase().includes(this.searchQuery.toLowerCase());
        
      const matchesStatus = this.filterStatus === 'ALL' || r.status === this.filterStatus;
        
      return matchesSearch && matchesStatus;
    });
  }
}
