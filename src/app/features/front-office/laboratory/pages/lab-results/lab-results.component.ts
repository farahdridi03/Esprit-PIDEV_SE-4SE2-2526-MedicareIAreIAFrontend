import { Component, OnInit } from '@angular/core';
import { LabResultService, LabResultResponse } from '../../../../../services/lab-result.service';
import { LabTestService, LabTestResponse } from '../../../../../services/lab-test.service';
import { LabRequestService, LabRequestResponse } from '../../../../../services/lab-request.service';
import { LabResultFormComponent } from './lab-result-form.component';

@Component({
  selector: 'app-lab-results',
  templateUrl: './lab-results.component.html',
  styleUrls: ['./lab-results.component.scss']
})
export class LabResultsComponent implements OnInit {

  results: LabResultResponse[] = [];
  filteredResults: LabResultResponse[] = [];
  labTests: LabTestResponse[] = [];

  stats = { total: 0, completed: 0, abnormal: 0, verified: 0 };

  searchTerm = '';
  selectedStatus = '';
  showForm = false;
  showDetail = false;
  editResult: LabResultResponse | null = null;
  viewResult: LabResultResponse | null = null;
  selectedLabTest: LabTestResponse | null = null;

  constructor(
    private labResultService: LabResultService,
    private labTestService: LabTestService
  ) {}

  ngOnInit(): void {
    this.loadResults();
    this.loadLabTests();
  }

  loadResults(): void {
    this.labResultService.getAll().subscribe({
      next: (data: LabResultResponse[]) => {
        this.results = data;
        this.filteredResults = data;
        this.computeStats(data);
      },
      error: (err: any) => console.error(err)
    });
  }

  loadLabTests(): void {
    this.labTestService.getAll().subscribe({
      next: (data: LabTestResponse[]) => { this.labTests = data; },
      error: (err: any) => console.error(err)
    });
  }

  computeStats(results: LabResultResponse[]): void {
    this.stats = {
      total: results.length,
      completed: results.filter(r => r.status === 'COMPLETED').length,
      abnormal: results.filter(r => r.isAbnormal === true).length,
      verified: results.filter(r => r.status === 'VERIFIED').length
    };
  }

  applyFilters(): void {
    this.filteredResults = this.results.filter(r => {
      const matchSearch = !this.searchTerm ||
        r.patientName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        r.technicianName?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.selectedStatus || r.status === this.selectedStatus;
      return matchSearch && matchStatus;
    });
  }

  openCreateFromTest(test: LabTestResponse): void {
    this.selectedLabTest = test;
    this.editResult = null;
    this.showForm = true;
  }

  openCreate(): void {
    this.selectedLabTest = null;
    this.editResult = null;
    this.showForm = true;
  }

  openEdit(result: LabResultResponse): void {
    this.editResult = result;
    this.selectedLabTest = null;
    this.showForm = true;
  }

  openView(result: LabResultResponse): void {
    this.viewResult = result;
    this.showDetail = true;
  }

  onDelete(result: LabResultResponse): void {
    if (confirm(`Delete result #LR-${result.id}?`)) {
      this.labResultService.delete(result.id).subscribe({
        next: () => {
          this.results = this.results.filter(r => r.id !== result.id);
          this.applyFilters();
          this.computeStats(this.results);
        },
        error: (err: any) => console.error(err)
      });
    }
  }

  onSaved(): void {
    this.showForm = false;
    this.editResult = null;
    this.selectedLabTest = null;
    this.loadResults();
  }

  onCancelled(): void {
    this.showForm = false;
    this.editResult = null;
    this.selectedLabTest = null;
  }

  getStatusClass(status: string): string {
    const map: any = {
      'COMPLETED': 'badge--completed',
      'PENDING': 'badge--pending',
      'ABNORMAL': 'badge--abnormal',
      'VERIFIED': 'badge--verified'
    };
    return 'badge ' + (map[status] || 'badge--pending');
  }

  getCategoryClass(category: string): string {
    const map: any = {
      'BLOOD_TEST': 'badge--blood',
      'IMAGING': 'badge--imaging',
      'URINE_TEST': 'badge--urine',
      'OTHER': 'badge--other'
    };
    return 'badge ' + (map[category] || 'badge--other');
  }
}
