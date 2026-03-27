import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '../../../../../services/patient.service';
import { PrescriptionService } from '../../../../../services/prescription.service';
import { ConsultationService } from '../../../../../services/consultation.service';

@Component({
  selector: 'app-doctor-patient-prescriptions',
  templateUrl: './doctor-patient-prescriptions.component.html',
  styleUrl: './doctor-patient-prescriptions.component.scss'
})
export class DoctorPatientPrescriptionsComponent implements OnInit {
  patientId!: number;
  patient: any = null;
  consultations: any[] = [];
  prescriptions: any[] = [];
  loading = true;
  
  // For Form
  showForm = false;
  isEdit = false;
  viewMode = false;
  currentViewItem: any = null;
  
  currentPrescription: any = {
    consultationId: null,
    medication: '',
    dosage: '',
    instructions: '',
    date: ''
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
    private prescriptionService: PrescriptionService,
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
            
            this.prescriptionService.getAll().subscribe({
              next: (allPrescriptions) => {
                this.prescriptions = allPrescriptions.filter((p: any) => validConsultationIds.includes(p.consultationId) || (p.consultation && validConsultationIds.includes(p.consultation.id)))
                  .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
                this.loading = false;
              },
              error: (err: any) => {
                console.error('Error fetching prescriptions', err);
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
    this.currentPrescription = {
      consultationId: this.consultations.length > 0 ? this.consultations[this.consultations.length-1].id : null,
      medication: '',
      dosage: '',
      instructions: '',
      date: new Date().toISOString().slice(0, 10)
    };
    this.showForm = true;
  }

  openEditForm(presc: any): void {
    this.isEdit = true;
    this.currentPrescription = { ...presc };
    
    // Format date for input type="date"
    if (this.currentPrescription.date) {
      this.currentPrescription.date = new Date(this.currentPrescription.date).toISOString().slice(0, 10);
    }
    
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
  }

  savePrescription(): void {
    if (!this.currentPrescription.consultationId) {
      alert("Please select a valid Consultation. If none exist, create one first.");
      return;
    }

    console.log('DEBUG: Saving prescription with payload:', this.currentPrescription);

    if (this.isEdit) {
      this.prescriptionService.update(this.currentPrescription.id, this.currentPrescription).subscribe({
        next: (res) => {
          if (res) {
            console.log('DEBUG: Prescription updated successfully:', res);
            this.loadData();
            this.showForm = false;
          } else {
            console.warn('Warning: The server returned a null response during prescription update.');
            alert("Warning: The prescription was not saved. This usually means the Consultation ID was not found in the database.");
          }
        },
        error: (err) => {
          console.error('Error updating prescription', err);
          alert("Error: Failed to update prescription. Check console for details.");
        }
      });
    } else {
      this.prescriptionService.add(this.currentPrescription).subscribe({
        next: (res) => {
          if (res) {
            console.log('DEBUG: Prescription added successfully:', res);
            this.loadData();
            this.showForm = false;
          } else {
            console.warn('Warning: The server returned a null response during prescription save.');
            alert("Warning: The prescription was not saved. This often means the Consultation ID was not found or required fields were missing.");
          }
        },
        error: (err) => {
          console.error('Error adding prescription', err);
          alert("Error: Failed to add prescription. Check console for details.");
        }
      });
    }
  }

  deletePrescription(id: number): void {
    if (confirm('Are you sure you want to delete this prescription?')) {
      this.prescriptionService.delete(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting prescription', err)
      });
    }
  }
}
