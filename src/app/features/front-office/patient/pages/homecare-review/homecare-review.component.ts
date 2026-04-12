import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HomecareService } from '../../../../../services/homecare.service';
import { ServiceRequest } from '../../../../../models/homecare.model';

@Component({
  selector: 'app-homecare-review',
  templateUrl: './homecare-review.component.html',
  styleUrls: ['./homecare-review.component.scss']
})
export class HomecareReviewComponent implements OnInit {
  reviewForm!: FormGroup;
  requestId!: number;
  requestDetails?: ServiceRequest;
  
  isLoading = true;
  isSubmitting = false;
  error = '';
  success = false;
  stars = [1, 2, 3, 4, 5];
  currentRating = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private homecare: HomecareService
  ) {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['requestId']) {
        this.requestId = +params['requestId'];
        this.loadRequestData();
      } else {
        this.error = 'No request specified to review.';
        this.isLoading = false;
      }
    });
  }

  loadRequestData(): void {
    this.homecare.getRequestById(this.requestId).subscribe({
      next: (req) => {
        this.requestDetails = req;
        if (req.status !== 'COMPLETED') {
          this.error = 'You can only review completed requests.';
        }
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load request details.';
        this.isLoading = false;
      }
    });
  }

  setRating(val: number): void {
    if (this.isSubmitting || this.success) return;
    this.currentRating = val;
    this.reviewForm.patchValue({ rating: val });
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) return;

    this.isSubmitting = true;
    this.homecare.submitReview(this.requestId, this.reviewForm.value).subscribe({
      next: () => {
        this.success = true;
        this.isSubmitting = false;
        setTimeout(() => {
          this.router.navigate(['/front/patient/homecare/my-requests']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to submit the review.';
        this.isSubmitting = false;
      }
    });
  }
}
