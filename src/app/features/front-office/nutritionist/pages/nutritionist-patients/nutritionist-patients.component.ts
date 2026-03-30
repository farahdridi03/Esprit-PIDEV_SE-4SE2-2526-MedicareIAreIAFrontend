import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from '../../../../../services/patient.service';
import { PatientResponseDTO } from '../../../../../models/patient.model';

@Component({
  selector: 'app-nutritionist-patients',
  templateUrl: './nutritionist-patients.component.html',
  styleUrl: './nutritionist-patients.component.scss'
})
export class NutritionistPatientsComponent implements OnInit {
  patients: PatientResponseDTO[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchPatients();
  }

  fetchPatients(): void {
    this.loading = true;
    this.patientService.getMyPatients().subscribe({
      next: (patientsData) => {
        this.patients = patientsData;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching patients:', err);
        this.error = 'Failed to load your patients. Please try again later.';
        this.loading = false;
      }
    });
  }

  viewPatient(patientId: number): void {
    this.router.navigate(['/front/nutritionist/patient', patientId]);
  }
}
