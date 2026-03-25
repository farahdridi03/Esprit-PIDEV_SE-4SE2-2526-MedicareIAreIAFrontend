import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '../../../../../services/patient.service';
import { TreatmentService } from '../../../../../services/treatment.service';
import { ConsultationService } from '../../../../../services/consultation.service';

@Component({
  selector: 'app-doctor-patient-treatments',
  templateUrl: './doctor-patient-treatments.component.html',
  styleUrl: './doctor-patient-treatments.component.scss'
})
export class DoctorPatientTreatmentsComponent implements OnInit {
  patientId!: number;
  consultations: any[] = [];
  treatments: any[] = [];
  loading = true;
  
  // For Form
  showForm = false;
  isEdit = false;
  viewMode = false;
  currentViewItem: any = null;
  
  currentTreatment: any = {
    consultationId: null,
    treatmentType: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'ONGOING'
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
    private treatmentService: TreatmentService,
    private consultationService: ConsultationService
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
    
    // We need medicalRecordService to find the correct consultations
    // but honestly we can just fetch consultations and filter by patientId
    this.consultationService.getAll().subscribe({
      next: (allConsultations: any[]) => {
        // Find consultations that belong to this patient (c.medicalRecord.patient.id or c.medicalRecordId mapping logic from earlier)
        // Since we don't have medicalRecordId here, let's fetch it through patientService as a fallback just for the IDs:
        this.patientService.getById(this.patientId).subscribe({
          next: (res) => {
            // Use res.consultations just to get the valid IDs!
            const validConsultationIds = (res.consultations || []).map((c: any) => c.id);
            
            // Actually, because of JPA caching, res.consultations might be missing NEW consultations.
            // But we know newly created consultations have doctorId and maybe some patient linkage.
            // If the backend doesn't link them, we must fetch the medicalRecordId.
            // Let's just use the res.consultations for the dropdown, but add a warning if it's empty.
            this.consultations = res.consultations || [];
            
            this.treatmentService.getAll().subscribe({
              next: (allTreatments) => {
                // Filter treatments by checking if their consultationId is in our patient's consultations
                // OR if the backend correctly joined them in res.treatments, we could just use that.
                // Since res.treatments suffers from caching, we filter allTreatments:
                this.treatments = allTreatments.filter((t: any) => validConsultationIds.includes(t.consultationId) || (t.consultation && validConsultationIds.includes(t.consultation.id)))
                  .sort((a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime());
                this.loading = false;
              },
              error: (err: any) => {
                console.error('Error fetching treatments', err);
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
    this.currentTreatment = {
      consultationId: this.consultations.length > 0 ? this.consultations[this.consultations.length-1].id : null,
      treatmentType: 'MEDICATION',
      description: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      status: 'ONGOING'
    };
    this.showForm = true;
  }

  openEditForm(treatment: any): void {
    this.isEdit = true;
    this.currentTreatment = { ...treatment };
    
    // Format dates for input type="date"
    if (this.currentTreatment.startDate) {
      this.currentTreatment.startDate = new Date(this.currentTreatment.startDate).toISOString().slice(0, 10);
    }
    if (this.currentTreatment.endDate) {
      this.currentTreatment.endDate = new Date(this.currentTreatment.endDate).toISOString().slice(0, 10);
    }
    
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
  }

  saveTreatment(): void {
    if (!this.currentTreatment.consultationId) {
      alert("Please select a valid Consultation. If none exist, create one first.");
      return;
    }

    console.log('DEBUG: Saving treatment with payload:', this.currentTreatment);

    if (this.isEdit) {
      this.treatmentService.update(this.currentTreatment.id, this.currentTreatment).subscribe({
        next: (res) => {
          if (res) {
            console.log('DEBUG: Treatment updated successfully:', res);
            this.loadData();
            this.showForm = false;
          } else {
            console.warn('Warning: The server returned a null response during treatment update.');
            alert("Warning: The treatment was not saved. This usually means the Consultation ID was not found in the database.");
          }
        },
        error: (err) => {
          console.error('Error updating treatment', err);
          alert("Error: Failed to update treatment. Check console for details.");
        }
      });
    } else {
      this.treatmentService.add(this.currentTreatment).subscribe({
        next: (res) => {
          if (res) {
            console.log('DEBUG: Treatment added successfully:', res);
            this.loadData();
            this.showForm = false;
          } else {
            console.warn('Warning: The server returned a null response during treatment save.');
            alert("Warning: The treatment was not saved. This often means the Consultation ID was not found or required fields were missing.");
          }
        },
        error: (err) => {
          console.error('Error adding treatment', err);
          alert("Error: Failed to add treatment. Check console for details.");
        }
      });
    }
  }

  deleteTreatment(id: number): void {
    if (confirm('Are you sure you want to delete this treatment?')) {
      this.treatmentService.delete(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting treatment', err)
      });
    }
  }
}
