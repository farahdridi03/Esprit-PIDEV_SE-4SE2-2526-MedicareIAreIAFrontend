import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '../../../../../services/patient.service';
import { ConsultationService } from '../../../../../services/consultation.service';
import { MedicalRecordService } from '../../../../../services/medical-record.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-doctor-patient-consultations',
  templateUrl: './doctor-patient-consultations.component.html',
  styleUrl: './doctor-patient-consultations.component.scss'
})
export class DoctorPatientConsultationsComponent implements OnInit {
  patientId!: number;
  consultations: any[] = [];
  loading = true;
  
  // For Form
  showForm = false;
  isEdit = false;
  viewMode = false;
  currentViewItem: any = null;
  medicalRecordId: number | null = null;
  doctorId: number | null = null;
  
  currentConsultation: any = {
    date: '',
    observations: '',
    notes: ''
  };

  openView(item: any): void {
    this.currentViewItem = item;
    this.viewMode = true;
    this.showForm = false;
  }

  closeView(): void {
    this.viewMode = false;
    this.currentViewItem = null;
  }

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService,
    private consultationService: ConsultationService,
    private medicalRecordService: MedicalRecordService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.patientId = +idParam;
      this.loadData();
    }
  }

  loadData(): void {
    this.loading = true;
    
    // Fetch doctor ID from JWT (now including 'id' claim)
    const userId = this.authService.getUserId();
    this.doctorId = userId; 
    console.log('DEBUG: Current Doctor ID from AuthService:', this.doctorId);

    // Fetch medical record directly for patient
    this.medicalRecordService.getByPatientId(this.patientId).subscribe({
      next: (record) => {
        if (record) {
          this.medicalRecordId = record.id;
          console.log('DEBUG: Found Medical Record ID:', this.medicalRecordId);
        } else {
          console.warn("No medical record found for patient " + this.patientId);
          this.medicalRecordId = null;
        }

        // Fetch consultations
        this.consultationService.getAll().subscribe({
          next: (res) => {
            let filtered = [...res];
            if (this.medicalRecordId) {
                filtered = filtered.filter((c: any) => 
                  c.medicalRecordId === this.medicalRecordId || 
                  (c.medicalRecord && c.medicalRecord.id === this.medicalRecordId)
                );
            } else {
                filtered = [];
            }
            this.consultations = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            this.loading = false;
          },
          error: (err) => {
            console.error('Error fetching consultations', err);
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching medical record by patient ID', err);
        this.loading = false;
      }
    });
  }

  openAddForm(): void {
    this.isEdit = false;
    this.currentConsultation = {
      date: new Date().toISOString().slice(0, 16),
      observations: '',
      notes: ''
    };
    this.showForm = true;
  }

  openEditForm(cons: any): void {
    this.isEdit = true;
    this.currentConsultation = { ...cons };
    // Format date for datetime-local input
    if (this.currentConsultation.date) {
      this.currentConsultation.date = new Date(this.currentConsultation.date).toISOString().slice(0, 16);
    }
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
  }

  saveConsultation(): void {
    if (!this.medicalRecordId) {
       alert("Cannot save consultation: This patient does not have a Medical Record yet. Please go to the 'My Patients' page and click 'Create Medical Record' for this patient first.");
       return;
    }
    
    if (!this.doctorId) {
      this.doctorId = 1;
    }

    // Prepare payload that satisfies both flat DTO and strict Entity relations
    const payload = {
      medicalRecordId: this.medicalRecordId,
      doctorId: this.doctorId,
      medicalRecord: { id: this.medicalRecordId },
      doctor: { id: this.doctorId },
      date: this.currentConsultation.date.length === 16 ? this.currentConsultation.date + ':00' : this.currentConsultation.date,
      observations: this.currentConsultation.observations,
      notes: this.currentConsultation.notes
    };

    console.log('DEBUG: Saving consultation with payload:', payload);

    if (this.isEdit) {
      this.consultationService.update(this.currentConsultation.id, payload).subscribe({
        next: (res) => {
          console.log('DEBUG: Consultation updated successfully:', res);
          if (!res) {
             console.error('DEBUG: Save returned NULL - check backend IDs');
             alert('Warning: The server returned a null response. The consultation might not have been found or IDs might be invalid.');
          }
          this.loadData();
          this.showForm = false;
        },
        error: (err) => {
          console.error('Error updating consultation:', err);
          alert(`Failed to update consultation: ${err.message || 'Unknown error'}`);
        }
      });
    } else {
      this.consultationService.add(payload).subscribe({
        next: (res) => {
          console.log('DEBUG: Consultation added successfully:', res);
          if (!res) {
             console.error('DEBUG: Save returned NULL - check backend IDs');
             alert('Warning: The server returned a null response. This often means the Medical Record ID or Doctor ID was not found in the database.');
          }
          this.loadData();
          this.showForm = false;
        },
        error: (err) => {
          console.error('Error adding consultation:', err);
          alert(`Failed to add consultation: ${err.message || 'Unknown error'}`);
        }
      });
    }
  }

  deleteConsultation(id: number): void {
    if (confirm('Are you sure you want to delete this consultation? This may delete all associated treatments and diagnoses!')) {
      this.consultationService.delete(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting consultation', err)
      });
    }
  }
}
