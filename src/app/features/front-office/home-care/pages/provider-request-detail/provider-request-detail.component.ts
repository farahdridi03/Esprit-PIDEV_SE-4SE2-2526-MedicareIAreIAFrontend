import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HomecareService } from '../../../../../services/homecare.service';
import { ServiceRequest, CompleteRequestDTO } from '../../../../../models/homecare.model';
import { ToastService } from '../../../../../services/toast.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  // Completion Modal
  showCompleteModal = false;
  completeForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private homecare: HomecareService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.completeForm = this.fb.group({
      providerNotes: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

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
    this.homecare.getRequestById(this.requestId).subscribe({
      next: (data) => {
        this.requestDetails = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Impossible de charger les détails de la demande.');
        this.isLoading = false;
      }
    });
  }

  acceptRequest(): void {
    this.isSubmitting = true;
    this.homecare.acceptRequest(this.requestId).subscribe({
      next: () => {
        this.toastService.success('Demande acceptée !');
        this.loadDetails();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Échec de l\'acceptation.');
        this.isSubmitting = false;
      }
    });
  }

  declineRequest(): void {
    if (confirm('Êtes-vous sûr de vouloir décliner cette demande ?')) {
      this.isSubmitting = true;
      this.homecare.declineRequest(this.requestId).subscribe({
        next: () => {
          this.toastService.warning('Demande déclinée.');
          this.loadDetails();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Échec du refus.');
          this.isSubmitting = false;
        }
      });
    }
  }

  startRequest(): void {
    this.isSubmitting = true;
    this.homecare.startRequest(this.requestId).subscribe({
      next: () => {
        this.toastService.info('Intervention commencée.');
        this.loadDetails();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Échec du démarrage.');
        this.isSubmitting = false;
      }
    });
  }

  openCompleteModal(): void {
    this.showCompleteModal = true;
    this.completeForm.reset();
  }

  closeCompleteModal(): void {
    this.showCompleteModal = false;
  }

  submitComplete(): void {
    if (this.completeForm.invalid) return;

    this.isSubmitting = true;
    const dto: CompleteRequestDTO = this.completeForm.value;

    this.homecare.completeRequest(this.requestId, dto).subscribe({
      next: () => {
        this.toastService.success('Intervention marquée comme terminée !');
        this.closeCompleteModal();
        this.loadDetails();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Échec de la validation de fin.');
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/front/home-care/dashboard']);
  }
}
