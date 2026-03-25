import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from '../../../../../services/patient.service';
import { MedicalRecordService } from '../../../../../services/medical-record.service';
import { PatientResponseDTO } from '../../../../../models/patient.model';

@Component({
  selector: 'app-doctor-patients',
  templateUrl: './doctor-patients.component.html',
  styleUrl: './doctor-patients.component.scss'
})
export class DoctorPatientsComponent implements OnInit {
  // Extending the original PatientResponseDTO for UI purposes
  patients: (PatientResponseDTO & { hasMedicalRecord?: boolean })[] = [];
  loading: boolean = true;
  error: string | null = null;
  creatingRecordForId: number | null = null;

  constructor(
    private patientService: PatientService,
    private medicalRecordService: MedicalRecordService,
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
        
        // Fetch Medical Records to map against patients
        this.medicalRecordService.getAll().subscribe({
          next: (records) => {
            this.patients.forEach(p => {
              // Check if any record matches this patient's ID
              p.hasMedicalRecord = !!(records as any[]).find(r => r.patientId === p.id || (r.patient && r.patient.id === p.id));
            });
            this.loading = false;
          },
          error: (err) => {
            console.error('Error fetching medical records:', err);
            // Default to hasMedicalRecord false if we can't fetch them, or show an error
            this.patients.forEach(p => p.hasMedicalRecord = false);
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching patients:', err);
        if (err.error && typeof err.error.text === 'string') {
          console.error('--- RAW SERVER RESPONSE TEXT ---');
          console.error(err.error.text);
          console.error('--------------------------------');
        } else if (err.message) {
          console.error('Error message:', err.message);
        }
        this.error = 'Failed to load patients details. Check console for exact server response format.';
        this.loading = false;
      }
    });
  }

  createMedicalRecord(patientId: number): void {
    this.creatingRecordForId = patientId;
    
    // First try the DTO-friendly exact match from our frontend model
    const payload = {
      patientId: patientId
    };

    this.medicalRecordService.add(payload).subscribe({
      next: () => {
        this.creatingRecordForId = null;
        this.router.navigate(['/front/doctor/patient', patientId, 'record']);
      },
      error: (err) => {
        console.error('Error creating Medical Record (Variant 1):', err.error || err);
        
        // Fallback Variant 2: Entity mapping { patient: { id } }
        console.warn("Attempting fallback Variant 2 payload...");
        this.medicalRecordService.add({ patient: { id: patientId } }).subscribe({
            next: () => {
                this.creatingRecordForId = null;
                this.router.navigate(['/front/doctor/patient', patientId, 'record']);
            },
            error: (err2) => {
                console.error('Fallback Variant 2 error:', err2.error || err2);
                
                // Fallback Variant 3: Entity mapping { user: { id } }
                console.warn("Attempting fallback Variant 3 payload...");
                this.medicalRecordService.add({ user: { id: patientId } }).subscribe({
                    next: () => {
                        this.creatingRecordForId = null;
                        this.router.navigate(['/front/doctor/patient', patientId, 'record']);
                    },
                    error: (err3) => {
                        this.creatingRecordForId = null;
                        console.error('Fallback Variant 3 error:', err3.error || err3);
                        alert('Failed to create medical record. Please check the console logs for validation errors.');
                    }
                });
            }
        });
      }
    });
  }
}

