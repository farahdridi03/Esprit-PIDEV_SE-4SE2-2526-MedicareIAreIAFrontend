import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConsultationService } from '../../../../../services/consultation.service';
import { Consultation } from '../../../../../models/medical-records.model';

@Component({
  selector: 'app-doctor-consultations',
  templateUrl: './doctor-consultations.component.html',
  styleUrl: './doctor-consultations.component.scss'
})
export class DoctorConsultationsComponent implements OnInit {
  patientId!: number;
  consultations: Consultation[] = [];
  loading = true;
  showForm = false;
  currentConsultation: Consultation = this.getEmptyConsultation();

  constructor(
    private route: ActivatedRoute,
    private consultationService: ConsultationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.patientId = +idParam;
        this.loadConsultations();
      }
    });
  }

  getEmptyConsultation(): Consultation {
    return { medicalRecordId: 0, doctorId: 0, date: '', notes: '', observations: '' };
  }

  loadConsultations(): void {
    this.loading = true;
    this.consultationService.getAll().subscribe({
      next: (data) => {
        // Just load all for now to mock, since this page is mostly obsolete
        this.consultations = data; 
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching consultations', err);
        this.loading = false;
      }
    });
  }

  openAddForm(): void {
    this.currentConsultation = this.getEmptyConsultation();
    this.showForm = true;
  }

  openEditForm(consultation: Consultation): void {
    this.currentConsultation = { ...consultation };
    this.showForm = true;
  }
  
  cancelForm(): void {
    this.showForm = false;
  }

  saveConsultation(): void {
    if (this.currentConsultation.id) {
      this.consultationService.update(this.currentConsultation.id, this.currentConsultation).subscribe({
        next: () => {
          this.loadConsultations();
          this.showForm = false;
        },
        error: (err) => console.error('Error updating consultation', err)
      });
    } else {
      this.currentConsultation.medicalRecordId = 1; // mock
      this.consultationService.add(this.currentConsultation).subscribe({
        next: () => {
          this.loadConsultations();
          this.showForm = false;
        },
        error: (err) => console.error('Error adding consultation', err)
      });
    }
  }

  deleteConsultation(id: number): void {
    if (confirm('Are you sure you want to delete this consultation?')) {
      this.consultationService.delete(id).subscribe({
        next: () => this.loadConsultations(),
        error: (err) => console.error('Error deleting consultation', err)
      });
    }
  }
}
