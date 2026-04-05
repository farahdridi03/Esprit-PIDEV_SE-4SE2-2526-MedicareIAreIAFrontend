import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TreatmentService } from '../../../../../services/treatment.service';
import { Treatment } from '../../../../../models/medical-records.model';

@Component({
  selector: 'app-doctor-treatments',
  templateUrl: './doctor-treatments.component.html',
  styleUrl: './doctor-treatments.component.scss'
})
export class DoctorTreatmentsComponent implements OnInit, OnChanges {
  @Input() consultationId!: number;
  
  treatments: Treatment[] = [];
  loading = true;
  showForm = false;
  minDate = '';
  currentTreatment: Treatment = this.getEmptyTreatment();


  constructor(
    private treatmentService: TreatmentService
  ) {}

  ngOnInit(): void {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    this.minDate = today.toISOString().split('T')[0];

    if (this.consultationId) {
      this.loadTreatments();
    }
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['consultationId'] && !changes['consultationId'].isFirstChange()) {
      this.loadTreatments();
    }
  }

  getEmptyTreatment(): Treatment {
    return { consultationId: this.consultationId || 0, treatmentType: '', description: '', startDate: new Date().toISOString().split('T')[0], endDate: '', status: 'ONGOING' } as any; 
  }

  isDateInFuture(dateStr: string | undefined): boolean {
    if (!dateStr) return true;
    try {
      const date = new Date(dateStr);
      const tomorrow = new Date();
      tomorrow.setHours(0,0,0,0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return targetDate.getTime() >= tomorrow.getTime();
    } catch (e) {
      return false;
    }
  }


  loadTreatments(): void {
    this.loading = true;
    this.treatmentService.getAll().subscribe({
      next: (data) => {
        this.treatments = data.filter(t => t.consultationId === this.consultationId);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching treatments', err);
        this.loading = false;
      }
    });
  }

  openAddForm(): void {
    this.currentTreatment = this.getEmptyTreatment();
    this.showForm = true;
  }


  openEditForm(treatment: Treatment): void {
    this.currentTreatment = { ...treatment };
    this.showForm = true;
  }
  
  cancelForm(): void {
    this.showForm = false;
  }

  saveTreatment(): void {
    if (this.currentTreatment.endDate && !this.isDateInFuture(this.currentTreatment.endDate)) {
      return;
    }

    if (this.currentTreatment.id) {

      this.treatmentService.update(this.currentTreatment.id, this.currentTreatment).subscribe({
        next: () => {
          this.loadTreatments();
          this.showForm = false;
        },
        error: (err) => console.error('Error updating treatment', err)
      });
    } else {
      this.currentTreatment.consultationId = this.consultationId;
      this.treatmentService.add(this.currentTreatment).subscribe({
        next: () => {
          this.loadTreatments();
          this.showForm = false;
        },
        error: (err) => console.error('Error adding treatment', err)
      });
    }
  }

  deleteTreatment(id: number): void {
    if (confirm('Are you sure you want to delete this treatment?')) {
      this.treatmentService.delete(id).subscribe({
        next: () => this.loadTreatments(),
        error: (err) => console.error('Error deleting treatment', err)
      });
    }
  }
}
