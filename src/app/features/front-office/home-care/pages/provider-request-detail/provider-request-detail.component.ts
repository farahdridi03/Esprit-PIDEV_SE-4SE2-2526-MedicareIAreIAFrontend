import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HomecareService } from '../../../../../services/homecare.service';
import { ServiceRequest } from '../../../../../models/homecare.model';

@Component({
  selector: 'app-provider-request-detail',
  templateUrl: './provider-request-detail.component.html',
  styleUrls: ['./provider-request-detail.component.scss']
})
export class ProviderRequestDetailComponent implements OnInit {
  requestDetails?: ServiceRequest;
  requestId!: number;
  isLoading = true;
  error = '';
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private homecare: HomecareService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.requestId = +params['id'];
        this.loadDetails();
      } else {
        this.error = 'No request ID provided.';
        this.isLoading = false;
      }
    });
  }

  loadDetails(): void {
    this.isLoading = true;
    // We get all provider requests and find the matching one, because getRequestById is patient-focused or admin-focused
    // Actually, getRequestById in the service doesn't restrict to user, but let's see.
    this.homecare.getRequestById(this.requestId).subscribe({
      next: (data) => {
        this.requestDetails = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load request details.';
        this.isLoading = false;
      }
    });
  }

  acceptRequest(): void {
    if (confirm('Accept this request?')) {
      this.isSubmitting = true;
      this.homecare.acceptRequest(this.requestId).subscribe({
        next: () => {
          this.loadDetails();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to accept request.';
          this.isSubmitting = false;
        }
      });
    }
  }

  declineRequest(): void {
    if (confirm('Are you sure you want to decline this request?')) {
      this.isSubmitting = true;
      this.homecare.declineRequest(this.requestId).subscribe({
        next: () => {
          this.loadDetails();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to decline request.';
          this.isSubmitting = false;
        }
      });
    }
  }

  startRequest(): void {
    if (confirm('Are you ready to start this intervention?')) {
      this.isSubmitting = true;
      this.homecare.startRequest(this.requestId).subscribe({
        next: () => {
          this.loadDetails();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to start request.';
          this.isSubmitting = false;
        }
      });
    }
  }

  completeRequest(): void {
    if (confirm('Mark this request as completed?')) {
      this.isSubmitting = true;
      this.homecare.completeRequest(this.requestId).subscribe({
        next: () => {
          this.loadDetails();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to complete request.';
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/front/home-care/dashboard']);
  }
}
