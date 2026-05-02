import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../../../../services/patient.service';
import { ConsultationService } from '../../../../../services/consultation.service';
import { PrescriptionService } from '../../../../../services/prescription.service';
import { TreatmentService } from '../../../../../services/treatment.service';
import { AuthService } from '../../../../../services/auth.service';
import { forkJoin, catchError, of } from 'rxjs';
import { PatientResponseDTO } from '../../../../../models/patient.model';
import { Consultation, Treatment, Prescription } from '../../../../../models/medical-records.model';

@Component({
  selector: 'app-doctor-workload',
  templateUrl: './doctor-workload.component.html',
  styleUrls: ['./doctor-workload.component.scss']
})
export class DoctorWorkloadComponent implements OnInit {
  selectedRange: string = '7';
  fromDate: string = '';
  toDate: string = '';

  totalPatients: number = 0;
  totalConsultations: number = 0;
  totalPrescriptions: number = 0;
  treatmentReviews: number = 0;
  pendingPrescriptions: number = 0;
  activeTreatments: number = 0;

  loading: boolean = false;
  selectedMetric: string | null = null;
  detailsList: any[] = [];

  // Raw data for filtering
  private allMyConsultations: any[] = [];
  private allMyPrescriptions: any[] = [];
  private allMyTreatments: any[] = [];

  constructor(
    private patientService: PatientService,
    private consultationService: ConsultationService,
    private prescriptionService: PrescriptionService,
    private treatmentService: TreatmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.updateDates();
  }

  onRangeChange(): void {
    this.updateDates();
  }

  private updateDates(): void {
    const now = new Date();
    this.toDate = now.toISOString();
    
    const days = parseInt(this.selectedRange);
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    this.fromDate = from.toISOString();

    this.fetchMetrics();
  }

  private fetchMetrics(): void {
    this.loading = true;
    const currentDoctorId = this.authService.getUserId();
    
    this.patientService.getMyPatients().subscribe({
      next: (patients: PatientResponseDTO[]) => {
        this.totalPatients = patients.length;
        
        // Flatten and enrich data with patient names
        this.allMyConsultations = [];
        this.allMyPrescriptions = [];
        this.allMyTreatments = [];

        patients.forEach((patient: PatientResponseDTO) => {
          // Consultations for this doctor
          const pConsultations = (patient.consultations || []).filter((c: any) => c.doctorId === currentDoctorId);
          pConsultations.forEach((c: any) => {
            this.allMyConsultations.push({ ...c, patientName: patient.fullName });
          });

          const pConsultationIds = pConsultations.map((c: any) => c.id);

          // Prescriptions related to those consultations
          (patient.prescriptions || []).forEach((p: any) => {
            if (pConsultationIds.includes(p.consultationId)) {
              this.allMyPrescriptions.push({ ...p, patientName: patient.fullName });
            }
          });

          // Treatments related to those consultations
          (patient.treatments || []).forEach((t: any) => {
            if (pConsultationIds.includes(t.consultationId)) {
              this.allMyTreatments.push({ ...t, patientName: patient.fullName });
            }
          });
        });

        const fromDateObj = new Date(this.fromDate);
        const toDateObj = new Date(this.toDate);

        // Filter consultations in range
        const filteredConsultations = this.allMyConsultations.filter(c => {
          const cDate = new Date(c.date);
          return cDate >= fromDateObj && cDate <= toDateObj;
        });
        this.totalConsultations = filteredConsultations.length;

        // Filter prescriptions in range
        const filteredPrescriptions = this.allMyPrescriptions.filter(p => {
          const pDate = new Date(p.date);
          return pDate >= fromDateObj && pDate <= toDateObj;
        });
        this.totalPrescriptions = filteredPrescriptions.length;

        // treatmentReviews: ongoing treatments ending in the next 3 days
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        
        this.treatmentReviews = this.allMyTreatments.filter(t => {
          if (!t.endDate || (t.status || '').toString().toUpperCase() !== 'ONGOING') return false;
          const endDate = new Date(t.endDate);
          return endDate >= now && endDate <= threeDaysFromNow;
        }).length;

        // pendingPrescriptions: active prescriptions
        this.pendingPrescriptions = this.allMyPrescriptions.filter(p => (p.status || '').toUpperCase() === 'ACTIVE').length;

        // activeTreatments: treatments with status ONGOING
        this.activeTreatments = this.allMyTreatments.filter(t => {
          const status = (t.status || '').toString().toUpperCase();
          return status === 'ONGOING';
        }).length;

        this.loading = false;
        
        if (this.selectedMetric) {
          this.showDetails(this.selectedMetric);
        }
      },
      error: (err) => {
        console.error('Error fetching workload metrics', err);
        this.loading = false;
      }
    });
  }

  showDetails(metric: string): void {
    this.selectedMetric = metric;
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    switch (metric) {
      case 'treatmentReviews':
        this.detailsList = this.allMyTreatments.filter(t => {
          if (!t.endDate || (t.status || '').toString().toUpperCase() !== 'ONGOING') return false;
          const endDate = new Date(t.endDate);
          return endDate >= now && endDate <= threeDaysFromNow;
        });
        break;
      case 'pendingPrescriptions':
        // Show prescriptions that are currently ACTIVE/Ongoing (last 24h as per previous logic, or just ACTIVE)
        // User said "those that still ongoing"
        this.detailsList = this.allMyPrescriptions.filter(p => (p.status || '').toUpperCase() === 'ACTIVE');
        break;
      case 'activeTreatments':
        this.detailsList = this.allMyTreatments.filter(t => (t.status || '').toUpperCase() === 'ONGOING');
        break;
      default:
        this.detailsList = [];
    }
  }
}
