import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../../../services/patient.service';
import { PatientResponseDTO } from '../../../../../models/patient.model';
import { LifestyleService } from '../../../../../services/lifestyle.service';

@Component({
  selector: 'app-nutritionist-patient-detail',
  templateUrl: './nutritionist-patient-detail.component.html',
  styleUrl: './nutritionist-patient-detail.component.scss'
})
export class NutritionistPatientDetailComponent implements OnInit {
  patientId: number | null = null;
  patient: PatientResponseDTO | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService,
    private lifestyleService: LifestyleService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = +params['id'];
      if (this.patientId) {
        this.fetchPatientDetails(this.patientId);
      }
    });
  }

  fetchPatientDetails(id: number): void {
    this.loading = true;
    this.patientService.getById(id).subscribe({
      next: (data) => {
        this.patient = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching patient details:', err);
        this.error = 'Failed to load patient health information.';
        this.loading = false;
      }
    });
  }

  formatLabel(label: string): string {
    if (!label) return 'N/A';
    return label.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getGoalIcon(category: string): string {
    switch (category) {
      case 'NUTRITION': return '🍎';
      case 'PHYSICAL_ACTIVITY': return '🏃';
      case 'SLEEP': return '🌙';
      case 'STRESS_MANAGEMENT': return '🧘';
      case 'WEIGHT_MANAGEMENT': return '⚖️';
      case 'HYDRATION': return '💧';
      default: return '🎯';
    }
  }

  getStatusClass(status: string): string {
    return status?.toLowerCase().replace('_', '-');
  }

  deletePlan(id: number): void {
    if (confirm('Are you sure you want to delete this dietary plan?')) {
      this.lifestyleService.deletePlan(id).subscribe({
        next: () => {
          if (this.patientId) this.fetchPatientDetails(this.patientId);
        },
        error: (err: any) => console.error('Error deleting plan:', err)
      });
    }
  }
}
