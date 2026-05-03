import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from '../../../../../services/patient.service';
import { NutritionService } from '../../../../../services/nutrition.service';
import { PatientResponseDTO } from '../../../../../models/patient.model';
import { DailyHealthReport } from '../../../../../models/nutrition.model';

@Component({
  selector: 'app-nutritionist-patients',
  templateUrl: './nutritionist-patients.component.html',
  styleUrl: './nutritionist-patients.component.scss'
})
export class NutritionistPatientsComponent implements OnInit {
  patients: PatientResponseDTO[] = [];
  loading: boolean = true;
  error: string | null = null;
  
  showOverview: boolean = false;
  healthReports: DailyHealthReport[] = [];
  loadingSummary: boolean = false;

  constructor(
    private patientService: PatientService,
    private nutritionService: NutritionService,
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

  toggleOverview(): void {
    this.showOverview = !this.showOverview;
    if (this.showOverview && this.healthReports.length === 0) {
      this.fetchHealthSummary();
    }
  }

  fetchHealthSummary(): void {
    this.loadingSummary = true;
    this.nutritionService.getLatestHealthSummary().subscribe({
      next: (reports) => {
        this.healthReports = reports;
        this.loadingSummary = false;
      },
      error: (err) => {
        console.error('Error fetching health summary:', err);
        this.loadingSummary = false;
      }
    });
  }

  get patientsNeedingAttention(): DailyHealthReport[] {
    return this.healthReports.filter(r => r.anomalyDetected);
  }

  get patientsOnTrack(): DailyHealthReport[] {
    return this.healthReports.filter(r => !r.anomalyDetected);
  }

  getStatusLabel(report: DailyHealthReport): string {
    if (report.missedLog) return 'Missed log';
    if (report.anomalies && report.anomalies.length > 0) {
      const anomaly = report.anomalies[0];
      switch (anomaly) {
        case 'OVEREATING': return 'Overeating';
        case 'UNDEREATING': return 'Undereating';
        case 'NO_WEIGHT_PROGRESS': return 'No progress';
        default: return anomaly;
      }
    }
    return 'On track';
  }

  getStatusClass(report: DailyHealthReport): string {
    if (report.missedLog) return 'status-missed';
    if (report.anomalies && report.anomalies.length > 0) {
      const anomaly = report.anomalies[0];
      switch (anomaly) {
        case 'OVEREATING': return 'status-overeating';
        case 'UNDEREATING': return 'status-undereating';
        case 'NO_WEIGHT_PROGRESS': return 'status-no-progress';
        default: return 'status-anomaly';
      }
    }
    return 'status-on-track';
  }

  hasAnomaly(report: DailyHealthReport, type: string): boolean {
    return report.anomalies && report.anomalies.some(a => a.toString() === type);
  }
}
