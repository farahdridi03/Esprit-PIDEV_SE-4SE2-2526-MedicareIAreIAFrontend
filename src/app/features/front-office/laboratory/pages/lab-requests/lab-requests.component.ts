import { Component, OnInit } from '@angular/core';
import { LaboratoryService } from '../../../../../services/laboratory.service';
import { LabRequestService, LabRequestResponse } from '../../../../../services/lab-request.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lab-requests',
  templateUrl: './lab-requests.component.html',
  styleUrls: ['./lab-requests.component.scss']
})
export class LaboratoryStaffLabRequestsComponent implements OnInit {
  pendingRequests: LabRequestResponse[] = [];
  loading = true;
  error = '';


  stats = {
    total: 0,
    urgent: 0,
    today: 0,
    pending: 0
  };

  constructor(
    private laboratoryService: LaboratoryService,
    private labRequestService: LabRequestService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPendingRequests();
  }

  loadPendingRequests() {
    this.loading = true;
    this.laboratoryService.getMyLaboratory().subscribe({
      next: (lab) => {
        this.labRequestService.getPendingByLaboratory(lab.id).subscribe({
          next: (requests) => {
            this.pendingRequests = requests;
            this.updateStats(requests);
            this.loading = false;
          },
          error: (err) => {
            console.error('Error fetching lab requests:', err);
            this.error = 'Failed to load requests.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching laboratory info:', err);
        this.error = 'Failed to load laboratory information.';
        this.loading = false;
      }
    });
  }

  updateStats(requests: LabRequestResponse[]) {
    this.stats.total = requests.length;
    this.stats.pending = requests.length;
    // Urgency is high/urgent if it satisfies some criteria, for now dummy counting
    this.stats.urgent = requests.filter(r => r.status === 'URGENT' || r.clinicalNotes?.toLowerCase().includes('urgent')).length;
    this.stats.today = requests.length; // Simplified
  }

  navigateToDashboard() {
    this.router.navigate(['/front/laboratorystaff/dashboard']);
  }


  acceptRequest(request: any) {
    console.log('Accepted:', request);
    // Logic to move to lab-tests
  }

  rejectRequest(request: any) {
    console.log('Rejected:', request);
  }
}
