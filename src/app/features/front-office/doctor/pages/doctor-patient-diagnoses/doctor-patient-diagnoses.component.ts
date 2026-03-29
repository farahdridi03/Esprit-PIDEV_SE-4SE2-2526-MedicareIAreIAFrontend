import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '../../../../../services/patient.service';
import { DiagnosisService } from '../../../../../services/diagnosis.service';
import { ConsultationService } from '../../../../../services/consultation.service';

@Component({
  selector: 'app-doctor-patient-diagnoses',
  templateUrl: './doctor-patient-diagnoses.component.html',
  styleUrl: './doctor-patient-diagnoses.component.scss'
})
export class DoctorPatientDiagnosesComponent implements OnInit {
  patientId!: number;
  patient: any = null;
  consultations: any[] = [];
  diagnoses: any[] = [];
  loading = true;
  
  // For Form
  showForm = false;
  isEdit = false;
  viewMode = false;
  currentViewItem: any = null;
  
  currentDiagnosis: any = {
    consultationId: null,
    type: '',
    description: '',
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
    private diagnosisService: DiagnosisService,
    private consultationService: ConsultationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.patientId = id;
        this.loadData();
      }
    });
  }

  loadData(): void {
    this.loading = true;
    
    this.consultationService.getAll().subscribe({
      next: (allConsultations: any[]) => {
        this.patientService.getById(this.patientId).subscribe({
          next: (res) => {
            this.patient = res;
            const validConsultationIds = (res.consultations || []).map((c: any) => c.id);
            this.consultations = res.consultations || [];
            
            this.diagnosisService.getAll().subscribe({
              next: (allDiagnoses) => {
                this.diagnoses = allDiagnoses.filter((d: any) => validConsultationIds.includes(d.consultationId) || (d.consultation && validConsultationIds.includes(d.consultation.id)));
                this.loading = false;
              },
              error: (err: any) => {
                console.error('Error fetching diagnoses', err);
                this.loading = false;
              }
            });
          },
          error: (err: any) => {
             console.error('Error fetching patient details', err);
             this.loading = false;
          }
        });
      },
      error: (err: any) => {
         console.error('Error fetching consultations', err);
         this.loading = false;
      }
    });
  }

  openAddForm(): void {
    this.isEdit = false;
    this.currentDiagnosis = {
      consultationId: this.consultations.length > 0 ? this.consultations[this.consultations.length-1].id : null,
      type: 'PRIMARY',
      description: '',
      notes: ''
    };
    this.showForm = true;
  }

  openEditForm(diag: any): void {
    this.isEdit = true;
    this.currentDiagnosis = { ...diag };
    this.showForm = true;
    this.viewMode = false; // Hide detail view when modifying
  }

  cancelForm(): void {
    this.showForm = false;
  }

  saveDiagnosis(): void {
    if (!this.currentDiagnosis.consultationId) {
      alert("Please select a valid Consultation. If none exist, create one first.");
      return;
    }

    console.log('DEBUG: Saving diagnosis with payload:', this.currentDiagnosis);

    if (this.isEdit) {
      this.diagnosisService.update(this.currentDiagnosis.id, this.currentDiagnosis).subscribe({
        next: (res) => {
          if (res) {
            console.log('DEBUG: Diagnosis updated successfully:', res);
            this.loadData();
            this.showForm = false;
          } else {
            console.warn('Warning: The server returned a null response during diagnosis update.');
            alert("Warning: The diagnosis was not saved. This usually means the Consultation ID was not found in the database.");
          }
        },
        error: (err) => {
          console.error('Error updating diagnosis', err);
          alert("Error: Failed to update diagnosis. Check console for details.");
        }
      });
    } else {
      this.diagnosisService.add(this.currentDiagnosis).subscribe({
        next: (res) => {
          if (res) {
            console.log('DEBUG: Diagnosis added successfully:', res);
            this.loadData();
            this.showForm = false;
          } else {
            console.warn('Warning: The server returned a null response during diagnosis save.');
            alert("Warning: The diagnosis was not saved. This often means the Consultation ID was not found or required fields were missing.");
          }
        },
        error: (err) => {
          console.error('Error adding diagnosis', err);
          alert("Error: Failed to add diagnosis. Check console for details.");
        }
      });
    }
  }

  deleteDiagnosis(id: number): void {
    if (confirm('Are you sure you want to delete this diagnosis?')) {
      this.diagnosisService.delete(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting diagnosis', err)
      });
    }
  }
}
