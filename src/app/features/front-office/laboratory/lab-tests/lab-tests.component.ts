import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { LabTestService, LabTestResponse } from '../../../../services/lab-test.service';
import { LabRequestService, LabRequestResponse } from '../../../../services/lab-request.service';
import { Router } from '@angular/router';
import { LaboratoryService } from '../../../../services/laboratory.service';
import { LaboratoryResponse } from '../../../../models/laboratory.model';

@Component({
  selector: 'app-lab-tests',
  templateUrl: './lab-tests.component.html',
  styleUrls: ['./lab-tests.component.scss']
})
export class LabTestsComponent implements OnInit {
  pendingRequests: LabRequestResponse[] = [];
  tests: LabTestResponse[] = [];
  filteredTests: LabTestResponse[] = [];
  
  stats = {
    total: 0,
    blood: 0,
    imaging: 0,
    other: 0
  };

  showForm = false;
  editTest: LabTestResponse | null = null;
  selectedRequest: LabRequestResponse | null = null;

  searchQuery = '';
  selectedTestType = '';
  currentLab: LaboratoryResponse | null = null;

  constructor(
    private authService: AuthService,
    private laboratoryService: LaboratoryService,
    private labTestService: LabTestService,
    private labRequestService: LabRequestService,
    private router: Router
  ) {}

  navigateToDashboard(): void {
    this.router.navigate(['/front/laboratorystaff/dashboard']);
  }


  ngOnInit(): void {
    this.laboratoryService.getMyLaboratory().subscribe({
      next: (lab) => {
        this.currentLab = lab;
        this.loadLabTests();
        this.loadPendingRequests();
      },
      error: (err) => console.error('Error fetching lab profile:', err)
    });
  }

  loadPendingRequests(): void {
    if (!this.currentLab) return;
    this.labRequestService.getPendingByLaboratory(this.currentLab.id).subscribe({
      next: (data: LabRequestResponse[]) => {
        this.pendingRequests = data;
      },
      error: (err: any) => console.error('Error:', err)
    });
  }

  loadLabTests(): void {
    if (!this.currentLab) return;
    this.labTestService.getByLaboratory(this.currentLab.id).subscribe({
      next: (data: LabTestResponse[]) => {
        this.tests = data;
        this.filteredTests = data;
        this.computeStats();
      },
      error: (err: any) => console.error('Error:', err)
    });
  }

  computeStats(): void {
    this.stats.total = this.tests.length;
    this.stats.blood = this.tests.filter(t => t.testType === 'BLOOD_TEST').length;
    this.stats.imaging = this.tests.filter(t => t.testType === 'IMAGING').length;
    this.stats.other = this.stats.total - this.stats.blood - this.stats.imaging;
  }

  openCreateFromRequest(request: LabRequestResponse): void {
    this.selectedRequest = request;
    this.editTest = null;
    this.showForm = true;
  }

  openCreate(): void {
    this.selectedRequest = null;
    this.editTest = null;
    this.showForm = true;
  }

  openEdit(test: LabTestResponse): void {
    this.editTest = test;
    this.selectedRequest = null;
    this.showForm = true;
  }

  onDelete(test: LabTestResponse): void {
    if (confirm('Are you sure you want to delete this test?')) {
      this.labTestService.delete(test.id).subscribe({
        next: () => {
          this.loadLabTests();
        },
        error: (err: any) => {
          console.error('Error deleting test:', err);
        }
      });
    }
  }

  onSaved(): void {
    this.showForm = false;
    this.editTest = null;
    this.selectedRequest = null;
    this.loadLabTests();
    this.loadPendingRequests();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onTestTypeChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.tests];

    // Apply search filter
    if (this.searchQuery.trim()) {
      filtered = filtered.filter(test => 
        test.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    // Apply test type filter
    if (this.selectedTestType) {
      filtered = filtered.filter(test => test.testType === this.selectedTestType);
    }

    this.filteredTests = filtered;
  }

  getTestTypeClass(testType: string): string {
    const typeClasses: Record<string, string> = {
      'BLOOD_TEST': 'badge badge--blood',
      'IMAGING': 'badge badge--imaging',
      'OTHER': 'badge badge--other'
    };
    return typeClasses[testType] || 'badge';
  }

  getTestTypeLabel(testType: string): string {
    return testType.replace('_', ' ');
  }
}
