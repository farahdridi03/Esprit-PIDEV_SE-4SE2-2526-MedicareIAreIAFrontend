import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PrescriptionService } from '../../../../../services/prescription.service';
import { Prescription } from '../../../../../models/medical-records.model';

@Component({
  selector: 'app-doctor-prescriptions',
  templateUrl: './doctor-prescriptions.component.html',
  styleUrl: './doctor-prescriptions.component.scss'
})
export class DoctorPrescriptionsComponent implements OnInit, OnChanges {
  @Input() consultationId!: number;
  
  prescriptions: Prescription[] = [];
  loading = true;
  showForm = false;
  currentPrescription: Prescription = this.getEmptyPrescription();

  constructor(
    private prescriptionService: PrescriptionService
  ) {}

  ngOnInit(): void {
    if (this.consultationId) {
      this.loadPrescriptions();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['consultationId'] && !changes['consultationId'].isFirstChange()) {
      this.loadPrescriptions();
    }
  }

  getEmptyPrescription(): Prescription {
    return { consultationId: this.consultationId || 0, date: new Date().toISOString().split('T')[0], items: [] } as any; 
  }

  loadPrescriptions(): void {
    this.loading = true;
    this.prescriptionService.getAll().subscribe({
      next: (data) => {
        this.prescriptions = data.filter(p => p.consultationId === this.consultationId);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching prescriptions', err);
        this.loading = false;
      }
    });
  }

  addItem(): void {
    if (!this.currentPrescription.items) this.currentPrescription.items = [];
    this.currentPrescription.items.push({ medicationName: '', dosage: '', frequency: '', duration: '' });
  }

  removeItem(index: number): void {
    this.currentPrescription.items.splice(index, 1);
  }

  openAddForm(): void {
    this.currentPrescription = { consultationId: this.consultationId, date: new Date().toISOString().split('T')[0], items: [] };
    this.addItem();
    this.showForm = true;
  }

  openEditForm(prescription: Prescription): void {
    // deep copy so we can mess with items without mutating real data before save
    this.currentPrescription = JSON.parse(JSON.stringify(prescription));
    if (!this.currentPrescription.items || this.currentPrescription.items.length === 0) {
      this.addItem();
    }
    this.showForm = true;
  }
  
  cancelForm(): void {
    this.showForm = false;
  }

  savePrescription(): void {
    if (this.currentPrescription.id) {
      this.prescriptionService.update(this.currentPrescription.id, this.currentPrescription).subscribe({
        next: () => {
          this.loadPrescriptions();
          this.showForm = false;
          alert('Prescription updated successfully');
        },
        error: (err) => {
          console.error('Error updating prescription', err);
          alert('Failed to update prescription. Please check the data.');
        }
      });
    } else {
      this.currentPrescription.consultationId = this.consultationId;
      this.prescriptionService.add(this.currentPrescription).subscribe({
        next: () => {
          this.loadPrescriptions();
          this.showForm = false;
          alert('Prescription added successfully');
        },
        error: (err) => {
          console.error('Error adding prescription', err);
          alert('Failed to add prescription. Please check the data.');
        }
      });
    }
  }

  deletePrescription(id: number): void {
    if (confirm('Are you sure you want to delete this prescription?')) {
      this.prescriptionService.delete(id).subscribe({
        next: () => this.loadPrescriptions(),
        error: (err) => console.error('Error deleting prescription', err)
      });
    }
  }
}
