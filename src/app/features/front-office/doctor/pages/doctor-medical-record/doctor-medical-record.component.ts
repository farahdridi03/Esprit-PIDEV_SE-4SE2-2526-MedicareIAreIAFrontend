import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../../../services/patient.service';
import { MedicalRecordService } from '../../../../../services/medical-record.service';
import { ConsultationService } from '../../../../../services/consultation.service';
import { AuthService } from '../../../../../services/auth.service';
import { PatientResponseDTO } from '../../../../../models/patient.model';

@Component({
  selector: 'app-doctor-medical-record',
  templateUrl: './doctor-medical-record.component.html',
  styleUrl: './doctor-medical-record.component.scss'
})
export class DoctorMedicalRecordComponent implements OnInit {
  patientId!: number;
  patient: PatientResponseDTO | null = null;
  medicalRecordId: number | null = null;
  loading = true;
  showConsultationForm = false;
  newConsultationDate = '';
  newConsultationObservations = '';
  newConsultationNotes = '';
  doctorId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private medicalRecordService: MedicalRecordService,
    private consultationService: ConsultationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.patientId = +idParam;
        this.loadPatientAndRecord();
      }
    });
  }

  loadPatientAndRecord(): void {
    this.loading = true;
    this.patientService.getById(this.patientId).subscribe({
      next: (res) => {
        this.patient = res;
        this.extractRecentItems();
        this.fetchMedicalRecordId();
      },
      error: (err) => {
        console.error('Error fetching patient details', err);
        this.loading = false;
      }
    });
  }

  recentConsultations: any[] = [];
  recentTreatments: any[] = [];
  recentPrescriptions: any[] = [];
  recentDiagnoses: any[] = [];

  extractRecentItems(): void {
    if (!this.patient) return;
    
    if (this.patient.consultations) {
      this.recentConsultations = [...this.patient.consultations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
    }
    
    if (this.patient.treatments) {
      this.recentTreatments = [...this.patient.treatments].sort((a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime()).slice(0, 3);
    }
    
    if (this.patient.prescriptions) {
      this.recentPrescriptions = [...this.patient.prescriptions].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, 3);
    }
    
    if (this.patient.diagnoses) {
      this.recentDiagnoses = [...this.patient.diagnoses].slice(0, 3); // Diagnoses might not have dates, just take top 3
    }
  }

  fetchMedicalRecordId(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.doctorId = userId;
    } else {
      this.doctorId = 1; // Fallback
    }

    this.medicalRecordService.getAll().subscribe({
      next: (records) => {
        const record = records.find(r => r.patientId === this.patientId);
        if (record) {
          this.medicalRecordId = record.id;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching medical records', err);
        this.loading = false;
      }
    });
  }

  toggleConsultationForm(): void {
    this.showConsultationForm = !this.showConsultationForm;
  }

  submitConsultation(): void {
    if (!this.medicalRecordId) {
      alert("Cannot save consultation: This patient does not have a Medical Record yet. Please go to the 'My Patients' page and click 'Create Medical Record' first.");
      return;
    }
    if (!this.doctorId) return;

    const payload = {
      medicalRecordId: this.medicalRecordId,
      doctorId: this.doctorId,
      date: this.newConsultationDate,
      observations: this.newConsultationObservations,
      notes: this.newConsultationNotes
    };

    this.consultationService.add(payload).subscribe({
      next: (res) => {
        // Add to the top of the timeline
        if (this.patient) {
          if (!this.patient.consultations) this.patient.consultations = [];
          this.patient.consultations.unshift(res);
          this.extractRecentItems();
        }
        this.showConsultationForm = false;
        this.newConsultationDate = '';
        this.newConsultationObservations = '';
        this.newConsultationNotes = '';
      },
      error: (err) => console.error('Error adding consultation', err)
    });
  }
}
