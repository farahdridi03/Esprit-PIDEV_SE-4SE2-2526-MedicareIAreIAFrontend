import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DiagnosisService } from '../../../../../services/diagnosis.service';
import { Diagnosis } from '../../../../../models/medical-records.model';

@Component({
  selector: 'app-doctor-diagnoses',
  templateUrl: './doctor-diagnoses.component.html',
  styleUrl: './doctor-diagnoses.component.scss'
})
export class DoctorDiagnosesComponent implements OnInit, OnChanges {
  @Input() consultationId!: number;
  
  diagnoses: Diagnosis[] = [];
  loading = true;
  showForm = false;
  currentDiagnosis: Diagnosis = this.getEmptyDiagnosis();

  constructor(
    private diagnosisService: DiagnosisService
  ) {}

  ngOnInit(): void {
    if (this.consultationId) {
      this.loadDiagnoses();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['consultationId'] && !changes['consultationId'].isFirstChange()) {
      this.loadDiagnoses();
    }
  }

  getEmptyDiagnosis(): Diagnosis {
    return { consultationId: this.consultationId || 0, condition: '', description: '', dateDiagnosed: '', type: 'PRIMARY' } as any; 
    // Wait, the new Diagnosis model is:
    // { consultationId, description, type } 
    // patientId, condition, dateDiagnosed are removed!
  }

  loadDiagnoses(): void {
    this.loading = true;
    this.diagnosisService.getAll().subscribe({
      next: (data) => {
        this.diagnoses = data.filter(d => d.consultationId === this.consultationId);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching diagnoses', err);
        this.loading = false;
      }
    });
  }

  openAddForm(): void {
    // Return proper empty diagnosis based on new model
    this.currentDiagnosis = { consultationId: this.consultationId, description: '', type: 'PRIMARY' };
    this.showForm = true;
  }

  openEditForm(diagnosis: Diagnosis): void {
    this.currentDiagnosis = { ...diagnosis };
    this.showForm = true;
  }
  
  cancelForm(): void {
    this.showForm = false;
  }

  saveDiagnosis(): void {
    if (this.currentDiagnosis.id) {
      this.diagnosisService.update(this.currentDiagnosis.id, this.currentDiagnosis).subscribe({
        next: () => {
          this.loadDiagnoses();
          this.showForm = false;
        },
        error: (err) => console.error('Error updating diagnosis', err)
      });
    } else {
      this.currentDiagnosis.consultationId = this.consultationId;
      this.diagnosisService.add(this.currentDiagnosis).subscribe({
        next: () => {
          this.loadDiagnoses();
          this.showForm = false;
        },
        error: (err) => console.error('Error adding diagnosis', err)
      });
    }
  }

  deleteDiagnosis(id: number): void {
    if (confirm('Are you sure you want to delete this diagnosis?')) {
      this.diagnosisService.delete(id).subscribe({
        next: () => this.loadDiagnoses(),
        error: (err) => console.error('Error deleting diagnosis', err)
      });
    }
  }
}
